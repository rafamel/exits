import _reset from '../reset-store';
import store from '~/store';
import { wait } from 'promist';
import handler from '~/utils/handler';
import _killWait from '~/utils/kill-wait';
import _playSignal from '~/utils/play-signal';
import { unattach as _unattach } from '~/methods/attach';
import _setState from '~/utils/set-state';
import logger from '~/logger';

logger.setLevel('silent');
jest.mock('~/methods/attach');
jest.mock('~/utils/kill-wait');
jest.mock('~/utils/play-signal');
jest.mock('~/utils/set-state');
const unattach: any = _unattach;
const playSignal: any = _playSignal;
const killWait: any = _killWait;
const setState: any = _setState;

const reset = () => {
  _reset();
  store.options.resolver = jest.fn();
};
const createTask = (cb: any) => ({
  priority: 0,
  on: { signal: true, exception: true, rejection: true, exit: true },
  cb
});
const addToStack = () => {
  store.stack = [
    createTask(() => wait(1000)),
    {
      priority: 0,
      on: { signal: true, exception: true, rejection: true, exit: true },
      cb: jest.fn()
    },
    {
      priority: 0,
      on: { signal: true, exception: false, rejection: false, exit: false },
      cb: jest.fn()
    },
    {
      priority: 0,
      on: { signal: false, exception: true, rejection: false, exit: false },
      cb: jest.fn()
    },
    {
      priority: 0,
      on: { signal: false, exception: false, rejection: true, exit: false },
      cb: jest.fn()
    },
    {
      priority: 0,
      on: { signal: false, exception: false, rejection: false, exit: true },
      cb: jest.fn()
    }
  ];
};

describe(`Doesn't run if already triggered`, () => {
  test(`triggered is any object`, async () => {
    expect.assertions(2);

    reset();
    addToStack();
    // @ts-ignore
    store.state.triggered = {};
    let res;
    handler('signal', 'SIGHUP').then(() => (res = true));

    await wait(100);
    expect(res).toBe(true);
    expect(store.options.resolver).not.toBeCalled();
  });
  test(`triggered is true`, async () => {
    expect.assertions(2);

    reset();
    addToStack();
    // @ts-ignore
    store.state.triggered = true;
    let res;
    handler('signal', 'SIGHUP').then(() => (res = true));

    await wait(100);
    expect(res).toBe(true);
    expect(store.options.resolver).not.toBeCalled();
  });
});

describe(`playSignal`, () => {
  test(`Doesn't run if type is signal and playSignal is false`, async () => {
    expect.assertions(3);
    playSignal.mockReset();
    playSignal.mockImplementationOnce(() => false);
    reset();
    addToStack();
    let res;
    handler('signal', 'SIGHUP').then(() => (res = true));

    await wait(100);
    expect(playSignal).toBeCalledWith('SIGHUP');
    expect(res).toBe(true);
    expect(store.options.resolver).not.toBeCalled();
  });
  test(`Doesn't check playSignal if type is not signal`, async () => {
    expect.assertions(1);
    playSignal.mockReset();

    reset();
    await handler('exit', 0);
    reset();
    await handler('rejection', Error());
    reset();
    await handler('exception', Error());
    reset();

    expect(playSignal).not.toBeCalled();
  });
});

describe(`tasks and resolver`, () => {
  test(`runs tasks`, async () => {
    expect.assertions(2);
    reset();
    addToStack();
    store.stack.shift();

    const fn = store.stack[0].cb;
    await handler('exit', 0);

    expect(store.options.resolver).toHaveBeenCalledWith('exit', 0);
    expect(fn).toHaveBeenCalledWith('exit', 0, {});
  });
  test(`runs tasks for signal`, async () => {
    expect.assertions(3);
    reset();
    addToStack();
    store.stack.shift();
    playSignal.mockImplementationOnce(() => true);

    const fns = [store.stack[0].cb, store.stack[1].cb];
    await handler('signal', 'SIGHUP');

    expect(store.options.resolver).toHaveBeenCalledWith('signal', 'SIGHUP');
    expect(fns[0]).toHaveBeenCalledWith('signal', 'SIGHUP', {});
    expect(fns[1]).toHaveBeenCalledWith('signal', 'SIGHUP', {});
  });
  test(`runs tasks for exception`, async () => {
    expect.assertions(3);
    reset();
    addToStack();
    store.stack.shift();

    const fns = [store.stack[0].cb, store.stack[2].cb];
    const err = Error();
    await handler('exception', err);

    expect(store.options.resolver).toHaveBeenCalledWith('exception', err);
    expect(fns[0]).toHaveBeenCalledWith('exception', err, {});
    expect(fns[1]).toHaveBeenCalledWith('exception', err, {});
  });
  test(`runs tasks for rejection`, async () => {
    expect.assertions(3);
    reset();
    addToStack();
    store.stack.shift();

    const fns = [store.stack[0].cb, store.stack[3].cb];
    const err = Error();
    await handler('rejection', err);

    expect(store.options.resolver).toHaveBeenCalledWith('rejection', err);
    expect(fns[0]).toHaveBeenCalledWith('rejection', err, {});
    expect(fns[1]).toHaveBeenCalledWith('rejection', err, {});
  });
  test(`runs tasks for exit`, async () => {
    expect.assertions(3);
    reset();
    addToStack();
    store.stack.shift();

    const fns = [store.stack[0].cb, store.stack[4].cb];
    await handler('exit', 5);

    expect(store.options.resolver).toHaveBeenCalledWith('exit', 5);
    expect(fns[0]).toHaveBeenCalledWith('exit', 5, {});
    expect(fns[1]).toHaveBeenCalledWith('exit', 5, {});
  });
  test(`runs in order and waits`, async () => {
    expect.assertions(4);
    reset();
    addToStack();
    store.stack.unshift(createTask(jest.fn()));

    const fns = [store.stack[0].cb, store.stack[2].cb, store.stack[6].cb];

    const p = handler('exit', 5);

    await wait(200);
    expect(fns[0]).toHaveBeenCalledWith('exit', 5, {});
    await p;
    expect(fns[1]).toHaveBeenCalledWith('exit', 5, {});
    expect(fns[2]).toHaveBeenCalledWith('exit', 5, {});
    expect(store.options.resolver).toHaveBeenCalledWith('exit', 5);
  });
  test(`shares context`, async () => {
    expect.assertions(1);
    reset();

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
    expect.assertions(7);
    reset();
    addToStack();
    killWait.mockReset();
    killWait.mockImplementation(() => wait(1000));

    let res;
    handler('exit', 0).then(() => (res = true));
    await wait(100);
    expect(killWait).toBeCalledTimes(1);
    await wait(1000);
    expect(killWait).toBeCalledTimes(1);
    await wait(1000);
    expect(killWait).toBeCalledTimes(2);
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
    expect.assertions(2);
    reset();

    const arr: number[] = [];
    store.stack = [
      createTask((_: any, __: any, context: any) => arr.push(1)),
      createTask((_: any, __: any, context: any) => Promise.reject(Error())),
      createTask((_: any, __: any, context: any) => arr.push(2)),
      createTask((_: any, __: any, context: any) => {
        throw Error();
      }),
      createTask((_: any, __: any, context: any) => arr.push(3))
    ];

    await handler('exit', 1);
    expect(arr).toEqual([1, 2, 3]);
    expect(store.options.resolver).toBeCalledWith('exit', 1);
  });
  test(`resolver gets called on error`, async () => {
    expect.assertions(2);
    reset();
    killWait.mockReset();
    killWait.mockImplementationOnce(() => Promise.reject(Error));

    await expect(handler('exit', 1)).resolves.not.toThrow();
    expect(store.options.resolver).toBeCalledWith('exit', 1);
  });
});

describe(`teardown`, () => {
  test(`Unattaches after being done`, async () => {
    expect.assertions(3);
    reset();
    addToStack();
    unattach.mockReset();

    expect(unattach).not.toBeCalled();
    const p = handler('exit', 1);

    await wait(100);
    expect(unattach).not.toBeCalled();
    await p;
    expect(unattach).toBeCalled();
  });
});

describe(`state`, () => {
  test(`updates state on start and finish`, async () => {
    expect.assertions(4);
    reset();
    addToStack();
    setState.mockReset();

    const p = handler('exit', 1);
    await wait(100);

    expect(setState).toHaveBeenCalledTimes(1);
    expect(setState).toBeCalledWith({ triggered: { type: 'exit', arg: 1 } });
    await p;
    expect(setState).toHaveBeenCalledTimes(2);
    expect(setState).toBeCalledWith({ done: true });
  });
});
