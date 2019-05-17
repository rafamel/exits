import resolver from '~/utils/resolver';
import store from '~/store';
import logger from '~/utils/logger';

logger.setLevel('silent');

const reset = (): void => {
  store.process = {
    pid: 777,
    kill: jest.fn(),
    exit: jest.fn()
  } as any;
};
const mocks: { [key: string]: jest.Mock } = {
  setImmediate: global.setImmediate = jest.fn()
};

beforeEach(() => {
  reset();
  Object.values(mocks).forEach((mock) => mock.mockClear());
});

test(`kills on signal`, () => {
  resolver('signal', 'SIGINT');
  expect(store.process.kill).toHaveBeenCalledTimes(1);
  expect(store.process.kill).toHaveBeenCalledWith(777, 'SIGINT');

  reset();
  resolver('signal', 'SIGHUP');
  expect(store.process.kill).toHaveBeenCalledTimes(1);
  expect(store.process.kill).toHaveBeenCalledWith(777, 'SIGHUP');
});

test(`exits on exit`, () => {
  resolver('exit', 0);
  expect(store.process.exit).toHaveBeenCalledTimes(1);
  expect(store.process.exit).toHaveBeenCalledWith(0);

  reset();
  resolver('exit', '1' as any);
  expect(store.process.exit).toHaveBeenCalledTimes(1);
  expect(store.process.exit).toHaveBeenCalledWith(1);
});

test(`throws on exception, rejection`, () => {
  resolver('exception', Error('Foo'));
  expect(mocks.setImmediate).toHaveBeenCalledTimes(1);
  expect(
    mocks.setImmediate.mock.calls[0][0]
  ).toThrowErrorMatchingInlineSnapshot(`"Foo"`);

  resolver('rejection', Error('Bar'));
  expect(mocks.setImmediate).toHaveBeenCalledTimes(2);
  expect(
    mocks.setImmediate.mock.calls[1][0]
  ).toThrowErrorMatchingInlineSnapshot(`"Bar"`);
});

test(`does nothing on bad type`, () => {
  resolver('badtype' as any, 0);
  expect(store.process.kill).toHaveBeenCalledTimes(0);
  expect(store.process.exit).toHaveBeenCalledTimes(0);
});
