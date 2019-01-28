import { exit } from '~/index';
import _handler from '~/utils/handler';
import resetStore from '../reset-store';
import store from '~/store';

const handler: any = _handler;
jest.mock('~/utils/handler');

const resetHandler = (): void => {
  handler.mockReset();
  handler.mockImplementation(() => Promise.resolve('foo'));
};

test(`calls handler with exit code when attached to exit`, async () => {
  expect.assertions(6);
  resetStore();
  store.state.attached.exit = true;

  resetHandler();
  const res1 = await exit(0);
  expect(res1).toBe('foo');
  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith('exit', 0);

  resetHandler();
  const res2 = await exit(1);
  expect(res2).toBe('foo');
  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith('exit', 1);
});

test(`calls resolver when not attached to exit`, async () => {
  expect.assertions(8);
  resetHandler();
  resetStore();
  store.state.attached.exit = false;
  const called: any[] = [];
  store.options.resolver = (...args) => {
    called.push(args);
    return Promise.resolve('bar');
  };

  const res1 = await exit(0);
  expect(handler).not.toBeCalled();
  expect(res1).toBe('bar');
  expect(called).toHaveLength(1);
  expect(called[0]).toEqual(['exit', 0]);

  const res2 = await exit(1);
  expect(handler).not.toBeCalled();
  expect(res2).toBe('bar');
  expect(called).toHaveLength(2);
  expect(called[1]).toEqual(['exit', 1]);
});
