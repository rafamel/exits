import resolver from '~/utils/resolver';
import store from '~/store';
import logger from '~/logger';

logger.setLevel('silent');

const reset = () => {
  // @ts-ignore
  store.process = {
    pid: 777,
    kill: jest.fn(),
    // @ts-ignore
    exit: jest.fn()
  };
};

test(`kills on signal`, () => {
  reset();
  resolver('signal', 'SIGINT');
  expect(store.process.kill).toHaveBeenCalledTimes(1);
  expect(store.process.kill).toHaveBeenCalledWith(777, 'SIGINT');

  reset();
  resolver('signal', 'SIGHUP');
  expect(store.process.kill).toHaveBeenCalledTimes(1);
  expect(store.process.kill).toHaveBeenCalledWith(777, 'SIGHUP');
});

test(`exits on exit`, () => {
  reset();
  resolver('exit', 0);
  expect(store.process.exit).toHaveBeenCalledTimes(1);
  expect(store.process.exit).toHaveBeenCalledWith(0);

  reset();
  // @ts-ignore
  resolver('exit', '1');
  expect(store.process.exit).toHaveBeenCalledTimes(1);
  expect(store.process.exit).toHaveBeenCalledWith(1);
});

test(`does nothing on bad type`, () => {
  reset();
  // @ts-ignore
  resolver('badtype', 0);
  expect(store.process.kill).toHaveBeenCalledTimes(0);
  expect(store.process.exit).toHaveBeenCalledTimes(0);
});
