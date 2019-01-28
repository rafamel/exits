import reset from '../reset-store';
import { attach, unattach } from '~/index';
import { handlers } from '~/methods/attach';
import { SIGNALS } from '~/constants';
import _setState from '~/utils/set-state';
import _handler from '~/utils/handler';
import _store from '~/store';

const store: any = _store;
const setState: any = _setState;
const handler: any = _handler;
jest.mock('~/utils/set-state');
jest.mock('~/utils/handler');

const create = (on: any): void => {
  reset();
  setState.mockReset();
  store.process = {
    on(event: string, cb: any) {
      if (on.hasOwnProperty(event)) {
        on._recall = true;
      }
      on[event] = cb;
    },
    removeListener(event: string, cb: any) {
      if (on[event] === cb) {
        delete on[event];
      }
    }
  };
};
const resetHandler = (): void => {
  handler.mockReset();
  handler.mockImplementation(() => Promise.resolve('foo'));
};

describe(`attach()`, () => {
  test(`attaches to all by default`, () => {
    const on: any = {};
    create(on);
    attach();

    expect(Object.keys(on)).toHaveLength(SIGNALS.length + 3);
    expect(on.uncaughtException).toBe(handlers.exception);
    expect(on.unhandledRejection).toBe(handlers.rejection);
    expect(on.beforeExit).toBe(handlers.exit);
    SIGNALS.forEach((signal) => {
      expect(on[signal]).toBe(handlers.signal);
    });
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: true,
        exception: true,
        rejection: true,
        exit: true
      }
    });
  });

  test(`doesn't duplicate attachments`, () => {
    const on: any = {};
    create(on);

    attach();
    store.state = {
      ...store.state,
      attached: {
        signal: true,
        exception: true,
        rejection: true,
        exit: true
      }
    };
    attach();

    expect(on._recall).toBeUndefined();
    expect(setState).toBeCalledTimes(1);
  });

  test(`attaches to those passed as true`, () => {
    const on1: any = {};
    create(on1);
    attach({
      signal: true,
      exception: false,
      rejection: true,
      exit: false
    });

    expect(on1.uncaughtException).toBeFalsy();
    expect(on1.unhandledRejection).toBe(handlers.rejection);
    expect(on1.beforeExit).toBeFalsy();
    SIGNALS.forEach((signal) => {
      expect(on1[signal]).toBe(handlers.signal);
    });
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: true,
        exception: false,
        rejection: true,
        exit: false
      }
    });

    const on2: any = {};
    create(on2);
    attach({
      signal: false,
      exception: true,
      rejection: false,
      exit: true
    });

    expect(on2.uncaughtException).toBe(handlers.exception);
    expect(on2.unhandledRejection).toBeFalsy();
    expect(on2.beforeExit).toBe(handlers.exit);
    SIGNALS.forEach((signal) => {
      expect(on2[signal]).toBeFalsy();
    });
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: false,
        exception: true,
        rejection: false,
        exit: true
      }
    });
  });

  test(`default attachment is true`, () => {
    const on: any = {};
    create(on);
    attach({ rejection: false });

    expect(on.uncaughtException).toBe(handlers.exception);
    expect(on.unhandledRejection).toBeFalsy();
    expect(on.beforeExit).toBe(handlers.exit);
    SIGNALS.forEach((signal) => {
      expect(on[signal]).toBe(handlers.signal);
    });
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: true,
        exception: true,
        rejection: false,
        exit: true
      }
    });
  });

  test(`adds missing attachments`, () => {
    const on: any = {};
    create(on);

    attach({ rejection: false });
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: true,
        exception: true,
        rejection: false,
        exit: true
      }
    });

    store.state = {
      ...store.state,
      attached: {
        signal: true,
        exception: true,
        rejection: false,
        exit: true
      }
    };
    attach({ exception: false });
    expect(setState).toBeCalledTimes(2);
    expect(setState).toBeCalledWith({
      attached: {
        signal: true,
        exception: true,
        rejection: true,
        exit: true
      }
    });
    expect(on._recall).toBeUndefined();
    expect(Object.keys(on)).toHaveLength(SIGNALS.length + 3);
  });
});

describe(`unattach()`, () => {
  test(`unattaches all by default`, () => {
    const on: any = {};
    create(on);
    attach();
    store.state.attached = {
      signal: true,
      exception: true,
      rejection: true,
      exit: true
    };
    setState.mockReset();

    unattach();
    expect(Object.keys(on)).toHaveLength(0);
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: false,
        exception: false,
        rejection: false,
        exit: false
      }
    });
  });
  test(`unattaches all that are attached`, () => {
    const on: any = {};
    create(on);

    attach({ rejection: false });
    store.state.attached = {
      signal: true,
      exception: true,
      rejection: false,
      exit: true
    };
    setState.mockReset();

    unattach();
    expect(Object.keys(on)).toHaveLength(0);
    expect(setState).toBeCalledTimes(1);
    expect(setState).toBeCalledWith({
      attached: {
        signal: false,
        exception: false,
        rejection: false,
        exit: false
      }
    });
  });
  test(`targeted unattachment`, () => {
    const on1: any = {};
    create(on1);
    attach({ rejection: false });
    store.state.attached = {
      signal: true,
      exception: true,
      rejection: false,
      exit: true
    };
    setState.mockReset();

    unattach({
      signal: true,
      exception: false,
      rejection: true,
      exit: false
    });
    expect(setState).toBeCalledTimes(1);
    expect(Object.keys(on1)).toHaveLength(2);
    expect(on1.uncaughtException).toBeTruthy();
    expect(on1.beforeExit).toBeTruthy();
    expect(setState).toBeCalledWith({
      attached: {
        signal: false,
        exception: true,
        rejection: false,
        exit: true
      }
    });

    const on2: any = {};
    create(on2);
    attach({ rejection: false });
    store.state.attached = {
      signal: true,
      exception: true,
      rejection: false,
      exit: true
    };
    setState.mockReset();

    unattach({
      signal: false,
      rejection: false
    });
    expect(setState).toBeCalledTimes(1);
    expect(Object.keys(on2)).toHaveLength(SIGNALS.length);
    SIGNALS.forEach((signal) => {
      expect(on2[signal]).toBeTruthy();
    });
    expect(setState).toBeCalledWith({
      attached: {
        signal: true,
        exception: false,
        rejection: false,
        exit: false
      }
    });
  });
  test(`doesn't do anything for all false`, () => {
    setState.mockReset();
    unattach({
      signal: false,
      exception: false,
      rejection: false,
      exit: false
    });
    expect(setState).not.toBeCalled();
  });
});

describe(`handlers`, () => {
  test(`signal calls handler with arg`, async () => {
    expect.assertions(6);

    resetHandler();
    const res1 = await handlers.signal('SIGINT');
    expect(res1).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('signal', 'SIGINT');

    resetHandler();
    const res2 = await handlers.signal('SIGTERM');
    expect(res2).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('signal', 'SIGTERM');
  });
  test(`exception calls handler with arg`, async () => {
    expect.assertions(3);
    resetHandler();

    const err = Error();
    const res = await handlers.exception(err);
    expect(res).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('exception', err);
  });
  test(`rejection calls handler with arg`, async () => {
    expect.assertions(7);

    resetHandler();
    const err = Error();
    const res1 = await handlers.rejection(null, Promise.reject(err));
    expect(res1).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('rejection', err);

    resetHandler();
    // eslint-disable-next-line prefer-promise-reject-errors
    const res2 = await handlers.rejection(null, Promise.reject('string'));
    expect(res2).toBe('foo');
    expect(handler).toBeCalledTimes(1);

    resetHandler();
    // eslint-disable-next-line prefer-promise-reject-errors
    const res3 = await handlers.rejection(null, Promise.reject());
    expect(res3).toBe('foo');
    expect(handler).toBeCalledTimes(1);
  });
  test(`exit calls handler with arg`, async () => {
    expect.assertions(6);

    resetHandler();
    const res1 = await handlers.exit(0);
    expect(res1).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('exit', 0);

    resetHandler();
    const res2 = await handlers.exit(1);
    expect(res2).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('exit', 1);
  });
});
