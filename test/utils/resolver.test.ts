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

beforeEach(reset);

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

test(`does nothing on bad type`, () => {
  resolver('badtype' as any, 0);
  expect(store.process.kill).toHaveBeenCalledTimes(0);
  expect(store.process.exit).toHaveBeenCalledTimes(0);
});
