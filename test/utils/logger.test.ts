/* eslint-disable no-console */
import logger, { setLevel } from '~/utils/logger';
import chalk from 'chalk';

chalk.enabled = false;
console.trace = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
const mocks: { [key: string]: jest.Mock } = {
  trace: console.trace,
  info: console.info,
  warn: console.warn,
  error: console.error
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`has default level`, () => {
  expect(logger.getLevel()).toBe(3);
});
test(`sets level`, () => {
  expect(setLevel('debug')).toBeUndefined();
  expect(logger.getLevel()).toBe(1);
});
test(`doesn't prefix over info`, () => {
  setLevel('info');

  logger.info('message');
  logger.error('message');
  logger.warn('message');
  expect(mocks.info).toHaveBeenCalledTimes(1);
  expect(mocks.info.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "message",
    ]
  `);
  expect(mocks.warn).toHaveBeenCalledTimes(1);
  expect(mocks.warn.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "WARN: message",
    ]
  `);
  expect(mocks.error).toHaveBeenCalledTimes(1);
  expect(mocks.error.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "ERROR: message",
    ]
  `);
});

test(`doesn't prefixes under info`, () => {
  setLevel('trace');

  logger.trace('message');
  logger.info('message');
  logger.error('message');
  logger.warn('message');
  expect(mocks.trace).toHaveBeenCalledTimes(1);
  expect(mocks.trace.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "[TRACE] exits: message",
    ]
  `);
  expect(mocks.info).toHaveBeenCalledTimes(1);
  expect(mocks.info.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "[INFO] exits: message",
    ]
  `);
  expect(mocks.warn).toHaveBeenCalledTimes(1);
  expect(mocks.warn.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "[WARN] exits: message",
    ]
  `);
  expect(mocks.error).toHaveBeenCalledTimes(1);
  expect(mocks.error.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "[ERROR] exits: message",
    ]
  `);
});
