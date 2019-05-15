import _reset from '../reset-store';
import store from '~/store';
import { wait } from 'promist';
import handler from '~/utils/handler';
import _killWait from '~/utils/kill-wait';
import _playSignal from '~/utils/play-signal';
import { unattach as _unattach } from '~/methods/attach';
import _setState from '~/utils/set-state';
import logger from '~/utils/logger';

logger.setLevel('silent');
jest.mock('~/methods/attach');
jest.mock('~/utils/kill-wait');
jest.mock('~/utils/play-signal');
jest.mock('~/utils/set-state');
const unattach: any = _unattach;
const playSignal: any = _playSignal;
const killWait: any = _killWait;
const setState: any = _setState;

const reset = (): void => {
  _reset();
  store.options.resolver = jest.fn();
};

beforeEach(reset);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTask = (fn: any) => ({
  priority: 0,
  on: { signal: true, exception: true, rejection: true, exit: true },
  fn
});
const addToStack = (): void => {
  store.stack = [
    createTask(() => wait(1000)),
    {
      priority: 0,
      on: { signal: true, exception: true, rejection: true, exit: true },
      fn: jest.fn()
    },
    {
      priority: 0,
      on: { signal: true, exception: false, rejection: false, exit: false },
      fn: jest.fn()
    },
    {
      priority: 0,
      on: { signal: false, exception: true, rejection: false, exit: false },
      fn: jest.fn()
    },
    {
      priority: 0,
      on: { signal: false, exception: false, rejection: true, exit: false },
      fn: jest.fn()
    },
    {
      priority: 0,
      on: { signal: false, exception: false, rejection: false, exit: true },
      fn: jest.fn()
    }
  ];
};

describe(`Doesn't run if already triggered`, () => {
  test(`triggered is any object`, async () => {
    addToStack();
    store.state.triggered = {} as any;
    let res;
    handler('signal', 'SIGHUP').then(() => (res = true));

    await wait(100);
    expect(res).toBe(true);
    expect(store.options.resolver).not.toHaveBeenCalled();
  });
  test(`triggered is true`, async () => {
    addToStack();
    store.state.triggered = true as any;
    let res;
    handler('signal', 'SIGHUP').then(() => (res = true));

    await wait(100);
    expect(res).toBe(true);
    expect(store.options.resolver).not.toHaveBeenCalled();
  });
});

describe(`playSignal`, () => {
  test(`Doesn't run if type is signal and playSignal is false`, async () => {
    playSignal.mockReset();
    playSignal.mockImplementationOnce(() => false);
    addToStack();
    let res;
    handler('signal', 'SIGHUP').then(() => (res = true));

    await wait(100);
    expect(playSignal).toHaveBeenCalledWith('SIGHUP');
    expect(res).toBe(true);
    expect(store.options.resolver).not.toHaveBeenCalled();
  });
  test(`Doesn't check playSignal if type is not signal`, async () => {
    playSignal.mockReset();

    await handler('exit', 0);

    reset();
    await handler('rejection', Error());

    reset();
    await handler('exception', Error());
    expect(playSignal).not.toHaveBeenCalled();
  });
});

describe(`tasks and resolver`, () => {
  test(`runs tasks`, async () => {
    addToStack();
    store.stack.shift();

    const fn = store.stack[0].fn;
    await handler('exit', 0);

    expect(store.options.resolver).toHaveBeenCalledWith('exit', 0);
    expect(fn).toHaveBeenCalledWith('exit', 0, {});
  });
  test(`runs tasks for signal`, async () => {
    addToStack();
    store.stack.shift();
    playSignal.mockImplementationOnce(() => true);

    const fns = [store.stack[0].fn, store.stack[1].fn];
    await handler('signal', 'SIGHUP');

    expect(store.options.resolver).toHaveBeenCalledWith('signal', 'SIGHUP');
    expect(fns[0]).toHaveBeenCalledWith('signal', 'SIGHUP', {});
    expect(fns[1]).toHaveBeenCalledWith('signal', 'SIGHUP', {});
  });
  test(`runs tasks for exception`, async () => {
    addToStack();
    store.stack.shift();

    const fns = [store.stack[0].fn, store.stack[2].fn];
    const err = Error();
    await handler('exception', err);

    expect(store.options.resolver).toHaveBeenCalledWith('exception', err);
    expect(fns[0]).toHaveBeenCalledWith('exception', err, {});
    expect(fns[1]).toHaveBeenCalledWith('exception', err, {});
  });
  test(`runs tasks for rejection`, async () => {
    addToStack();
    store.stack.shift();

    const fns = [store.stack[0].fn, store.stack[3].fn];
    const err = Error();
    await handler('rejection', err);

    expect(store.options.resolver).toHaveBeenCalledWith('rejection', err);
    expect(fns[0]).toHaveBeenCalledWith('rejection', err, {});
    expect(fns[1]).toHaveBeenCalledWith('rejection', err, {});
  });
  test(`runs tasks for exit`, async () => {
    addToStack();
    store.stack.shift();

    const fns = [store.stack[0].fn, store.stack[4].fn];
    await handler('exit', 5);

    expect(store.options.resolver).toHaveBeenCalledWith('exit', 5);
    expect(fns[0]).toHaveBeenCalledWith('exit', 5, {});
    expect(fns[1]).toHaveBeenCalledWith('exit', 5, {});
  });
  test(`runs in order and waits`, async () => {
    addToStack();
    store.stack.unshift(createTask(jest.fn()));

    const fns = [store.stack[0].fn, store.stack[2].fn, store.stack[6].fn];

    const p = handler('exit', 5);

    await wait(200);
    expect(fns[0]).toHaveBeenCalledWith('exit', 5, {});
    await p;
    expect(fns[1]).toHaveBeenCalledWith('exit', 5, {});
    expect(fns[2]).toHaveBeenCalledWith('exit', 5, {});
    expect(store.options.resolver).toHaveBeenCalledWith('exit', 5);
  });
  test(`shares context`, async () => {
    let a;
    store.stack = [
      createTask(
        (_: any, __: any, context: any) => (context.a = 1) && undefined
      ),
      createTask(
        (_: any, __: any, context: any) => (a = context.a) && undefined
      )
    ];

    await handler('exit', 1);
    expect(a).toBe(1);
  });
});

describe(`killWait`, () => {
  test(`waits for killWait before and after running tasks`, async () => {
    addToStack();
    killWait.mockReset();
    killWait.mockImplementation(() => wait(1000));

    let res;
    handler('exit', 0).then(() => (res = true));
    await wait(100);
    expect(killWait).toHaveBeenCalledTimes(1);
    await wait(1000);
    expect(killWait).toHaveBeenCalledTimes(1);
    await wait(1000);
    expect(killWait).toHaveBeenCalledTimes(2);
    expect(store.options.resolver).not.toHaveBeenCalled();
    expect(res).not.toBe(true);
    await wait(1000);
    expect(res).toBe(true);
    expect(store.options.resolver).toHaveBeenCalledWith('exit', 0);

    killWait.mockReset();
  });
});

describe(`errors`, () => {
  test(`tasks continue running on task error`, async () => {
    const arr: number[] = [];
    store.stack = [
      createTask(() => arr.push(1)),
      createTask(() => Promise.reject(Error())),
      createTask(() => arr.push(2)),
      createTask(() => {
        throw Error();
      }),
      createTask(() => arr.push(3))
    ];

    await handler('exit', 1);
    expect(arr).toEqual([1, 2, 3]);
    expect(store.options.resolver).toHaveBeenCalledWith('exit', 1);
  });
  test(`resolver gets called on error`, async () => {
    killWait.mockReset();
    killWait.mockImplementationOnce(() => Promise.reject(Error));

    await expect(handler('exit', 1)).resolves.not.toThrow();
    expect(store.options.resolver).toHaveBeenCalledWith('exit', 1);
  });
});

describe(`teardown`, () => {
  test(`Unattaches after being done`, async () => {
    addToStack();
    unattach.mockReset();

    expect(unattach).not.toHaveBeenCalled();
    const p = handler('exit', 1);

    await wait(100);
    expect(unattach).not.toHaveBeenCalled();
    await p;
    expect(unattach).toHaveBeenCalled();
  });
});

describe(`state`, () => {
  test(`updates state on start and finish`, async () => {
    addToStack();
    setState.mockReset();

    const p = handler('exit', 1);
    await wait(100);

    expect(setState).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith({
      triggered: { type: 'exit', arg: 1 }
    });
    await p;
    expect(setState).toHaveBeenCalledTimes(2);
    expect(setState).toHaveBeenCalledWith({ done: true });
  });
});
