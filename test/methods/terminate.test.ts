import { terminate } from '~/index';
import _handler from '~/utils/handler';
import resetStore from '../reset-store';
import store from '~/store';

const handler: any = _handler;
jest.mock('~/utils/handler');

const resetHandler = (): void => {
  handler.mockReset();
  handler.mockImplementation(() => Promise.resolve('foo'));
};

beforeEach(() => {
  resetStore();
  resetHandler();
});

describe(`signal`, () => {
  test(`calls handler with signal when attached to signal`, async () => {
    store.state.attached.signal = true;

    const res1 = await terminate('signal', 'SIGINT');
    expect(res1).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('signal', 'SIGINT');

    resetHandler();
    const res2 = await terminate('signal', 'SIGHUP');
    expect(res2).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('signal', 'SIGHUP');
  });
  test(`calls resolver when not attached to signal`, async () => {
    store.state.attached.signal = false;
    const called: any[] = [];
    store.options.resolver = (...args) => {
      called.push(args);
      return Promise.resolve('bar');
    };

    const res1 = await terminate('signal', 'SIGINT');
    expect(handler).not.toBeCalled();
    expect(res1).toBe('bar');
    expect(called).toHaveLength(1);
    expect(called[0]).toEqual(['signal', 'SIGINT']);

    const res2 = await terminate('signal', 'SIGHUP');
    expect(handler).not.toBeCalled();
    expect(res2).toBe('bar');
    expect(called).toHaveLength(2);
    expect(called[1]).toEqual(['signal', 'SIGHUP']);
  });
});

describe(`exception`, () => {
  test(`calls handler with error when attached to exception`, async () => {
    store.state.attached.exception = true;

    const err = Error();
    const res = await terminate('exception', err);
    expect(res).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('exception', err);
  });
  test(`calls resolver when not attached to exception`, async () => {
    store.state.attached.exception = false;
    const called: any[] = [];
    store.options.resolver = (...args) => {
      called.push(args);
      return Promise.resolve('bar');
    };

    const err = Error();
    const res = await terminate('exception', err);
    expect(handler).not.toBeCalled();
    expect(res).toBe('bar');
    expect(called).toHaveLength(1);
    expect(called[0]).toEqual(['exception', err]);
  });
});

describe(`rejection`, () => {
  test(`calls handler with error when attached to rejection`, async () => {
    store.state.attached.rejection = true;

    const err = Error();
    const res = await terminate('rejection', err);
    expect(res).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('rejection', err);
  });
  test(`calls resolver when not attached to rejection`, async () => {
    store.state.attached.rejection = false;
    const called: any[] = [];
    store.options.resolver = (...args) => {
      called.push(args);
      return Promise.resolve('bar');
    };

    const err = Error();
    const res = await terminate('rejection', err);
    expect(handler).not.toBeCalled();
    expect(res).toBe('bar');
    expect(called).toHaveLength(1);
    expect(called[0]).toEqual(['rejection', err]);
  });
});

describe(`exit`, () => {
  test(`calls handler with exit code when attached to exit`, async () => {
    store.state.attached.exit = true;

    const res1 = await terminate('exit', 0);
    expect(res1).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('exit', 0);

    resetHandler();
    const res2 = await terminate('exit', 1);
    expect(res2).toBe('foo');
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith('exit', 1);
  });
  test(`calls resolver when not attached to exit`, async () => {
    store.state.attached.exit = false;
    const called: any[] = [];
    store.options.resolver = (...args) => {
      called.push(args);
      return Promise.resolve('bar');
    };

    const res1 = await terminate('exit', 0);
    expect(handler).not.toBeCalled();
    expect(res1).toBe('bar');
    expect(called).toHaveLength(1);
    expect(called[0]).toEqual(['exit', 0]);

    const res2 = await terminate('exit', 1);
    expect(handler).not.toBeCalled();
    expect(res2).toBe('bar');
    expect(called).toHaveLength(2);
    expect(called[1]).toEqual(['exit', 1]);
  });
});

describe(`unknown type`, () => {
  test(`calls resolver when not attached`, async () => {
    store.state.attached = {
      signal: false,
      exception: false,
      rejection: false,
      exit: false
    };
    const called: any[] = [];
    store.options.resolver = (...args) => {
      called.push(args);
      return Promise.resolve('bar');
    };

    const res = await terminate('unknown_type' as any, 0);
    expect(handler).not.toBeCalled();
    expect(res).toBe('bar');
    expect(called).toHaveLength(1);
    expect(called[0]).toEqual(['unknown_type', 0]);
  });
  test(`calls resolver when attached`, async () => {
    store.state.attached = {
      signal: true,
      exception: true,
      rejection: true,
      exit: true
    };
    const called: any[] = [];
    store.options.resolver = (...args) => {
      called.push(args);
      return Promise.resolve('bar');
    };

    const res = await terminate('unknown_type' as any, 0);
    expect(handler).not.toBeCalled();
    expect(res).toBe('bar');
    expect(called).toHaveLength(1);
    expect(called[0]).toEqual(['unknown_type', 0]);
  });
});
