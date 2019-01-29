import reset, { cloned } from '../reset-store';
import store from '~/store';
import { options } from '~/index';
import logger from '~/utils/logger';
import { IOptions } from '~/types';

test(`preserves options`, () => {
  reset();
  options({});
  expect(store.options).toEqual(cloned.options);

  reset();
  options();
  expect(store.options).toEqual(cloned.options);
});

test(`writes options`, () => {
  reset();

  const obj: Partial<IOptions> = { logger: 'debug', resolver: () => {} };
  options(obj);

  expect(store.options).toEqual({ ...cloned.options, ...obj });
});

test(`sets logger level`, () => {
  reset();

  options({ logger: 'debug' });
  expect(logger.getLevel()).toBe(1);
  options({ logger: 'warn' });
  expect(logger.getLevel()).toBe(3);
});

test(`writes spawned options`, () => {
  reset();

  const obj: Partial<IOptions> = {
    logger: 'error',
    spawned: { signals: 'all', wait: 'none', sigterm: 4555 }
  };
  options(obj);

  expect(store.options).toEqual({
    ...cloned.options,
    ...obj,
    spawned: {
      ...cloned.options.spawned,
      ...obj.spawned
    }
  });
});
