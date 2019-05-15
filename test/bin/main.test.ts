import main from '~/bin/main';
import { options, spawn, attach, add, resolver } from '~/index';
import logger from '~/utils/logger';

logger.setLevel('silent');
jest.mock('~/index');
const mocks: { [key: string]: jest.Mock } = {
  options,
  spawn,
  attach,
  add,
  resolver,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
const fns = [mocks.options, mocks.spawn, mocks.attach, mocks.add];

mocks.spawn.mockImplementation(() => ({ promise: Promise.resolve() }));
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

describe(`parsing`, () => {
  test(`shows help`, async () => {
    await expect(main(['--help'])).resolves.toBeUndefined();
    await expect(main(['-h'])).resolves.toBeUndefined();

    expect(mocks.console).toHaveBeenCalledTimes(2);
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
  test(`shows version`, async () => {
    await expect(main(['--version'])).resolves.toBeUndefined();
    await expect(main(['-v'])).resolves.toBeUndefined();

    expect(mocks.console).toHaveBeenCalledTimes(2);
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
  test(`fails on unknown arg`, async () => {
    const args = '-e dev'.split(' ');
    await expect(main(args)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unknown or unexpected option: -e"`
    );
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
  test(`shows help and fails on no command`, async () => {
    await expect(main([])).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Two commands to run are required"`
    );

    expect(mocks.console).toHaveBeenCalledTimes(1);
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
  test(`shows help and fails on one command`, async () => {
    await expect(main(['foo'])).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Two commands to run are required"`
    );

    expect(mocks.console).toHaveBeenCalledTimes(1);
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
  test(`fails on three commands`, async () => {
    const args = 'foo bar baz'.split(' ');
    await expect(main(args)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Only two commands are allowed to be passed"`
    );

    expect(mocks.console).toHaveBeenCalledTimes(1);
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
  test(`succeeds on two commands`, async () => {
    const args = 'foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    expect(mocks.console).not.toHaveBeenCalled();
    expect(mocks.add).toHaveBeenCalledTimes(2);
    fns.forEach((fn) => expect(fn).toHaveBeenCalled());
  });
});
describe(`options`, () => {
  test(`calls w/ defaults`, async () => {
    const args = 'foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    expect(mocks.options).toHaveBeenCalledTimes(1);
    expect(mocks.options.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "logger": "info",
          "spawned": Object {
            "signals": "none",
            "wait": "all",
          },
        },
      ]
    `);
  });
  test(`calls w/ log`, async () => {
    const args = '--log debug foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    expect(mocks.options).toHaveBeenCalledTimes(1);
    expect(mocks.options.mock.calls[0][0]).toHaveProperty('logger', 'debug');
  });
});
describe(`--at`, () => {
  describe(`success,signal,error`, () => {
    test(`success`, async () => {
      const arr = ['--at success,signal,error foo bar', 'foo bar'];
      for (let args of arr) {
        mocks.add.mockClear();

        await expect(main(args.split(' '))).resolves.toBeUndefined();
        expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

        const fn = mocks.add.mock.calls[0][1];
        const context = { run: false };
        await expect(fn(null, null, context)).resolves.toBeUndefined();
        expect(context.run).toBe(true);
      }
    });
    test(`signal`, async () => {
      const arr = ['--at success,signal,error foo bar', 'foo bar'];
      for (let args of arr) {
        mocks.add.mockClear();
        mocks.spawn.mockImplementationOnce(() => ({
          promise: Promise.resolve('SIGTERM')
        }));

        await expect(main(args.split(' '))).resolves.toBeUndefined();
        expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

        const fn = mocks.add.mock.calls[0][1];
        const context = { run: false };
        await expect(fn(null, null, context)).resolves.toBeUndefined();
        expect(context.run).toBe(true);
      }
    });
    test(`error`, async () => {
      const arr = ['--at success,signal,error foo bar', 'foo bar'];
      for (let args of arr) {
        mocks.add.mockClear();
        mocks.spawn.mockImplementationOnce(() => ({
          promise: Promise.reject(Error())
        }));

        await expect(main(args.split(' '))).resolves.toBeUndefined();
        expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

        const fn = mocks.add.mock.calls[0][1];
        const context = { run: false };
        await expect(fn(null, null, context)).resolves.toBeUndefined();
        expect(context.run).toBe(true);
      }
    });
  });
  describe(`success`, () => {
    test(`success`, async () => {
      const args = '--at success foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(true);
    });
    test(`signal`, async () => {
      mocks.spawn.mockImplementationOnce(() => ({
        promise: Promise.resolve('SIGTERM')
      }));

      const args = '--at success foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(false);
    });
    test(`error`, async () => {
      mocks.spawn.mockImplementationOnce(() => ({
        promise: Promise.reject(Error())
      }));

      const args = '--at success foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(false);
    });
  });
  describe(`signal`, () => {
    test(`success`, async () => {
      const args = '--at signal foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(false);
    });
    test(`signal`, async () => {
      mocks.spawn.mockImplementationOnce(() => ({
        promise: Promise.resolve('SIGTERM')
      }));

      const args = '--at signal foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(true);
    });
    test(`error`, async () => {
      mocks.spawn.mockImplementationOnce(() => ({
        promise: Promise.reject(Error())
      }));

      const args = '--at signal foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(false);
    });
  });
  describe(`error`, () => {
    test(`success`, async () => {
      const args = '--at error foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(false);
    });
    test(`signal`, async () => {
      mocks.spawn.mockImplementationOnce(() => ({
        promise: Promise.resolve('SIGTERM')
      }));

      const args = '--at error foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(false);
    });
    test(`error`, async () => {
      mocks.spawn.mockImplementationOnce(() => ({
        promise: Promise.reject(Error())
      }));

      const args = '--at error foo bar'.split(' ');
      await expect(main(args)).resolves.toBeUndefined();
      expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

      const fn = mocks.add.mock.calls[0][1];
      const context = { run: false };
      await expect(fn(null, null, context)).resolves.toBeUndefined();
      expect(context.run).toBe(true);
    });
  });
});
describe(`spawn`, () => {
  test(`spawn is initially called only once w/ main command`, async () => {
    const args = 'foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn.mock.calls[0][0]).toMatchInlineSnapshot(`"foo"`);
    expect(mocks.spawn.mock.calls[0][1]).toMatchInlineSnapshot(`Array []`);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('shell', true);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('stdio', 'inherit');
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('env');
  });
  test(`second hook only calls spawn if context.run = true w/ last command`, async () => {
    const args = 'foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();
    expect(mocks.add).toHaveBeenCalledTimes(2);
    expect(typeof mocks.add.mock.calls[1][1]).toBe('function');

    mocks.spawn.mockClear();
    const fn = mocks.add.mock.calls[1][1];
    await fn(null, null, { run: false });
    expect(mocks.spawn).toHaveBeenCalledTimes(0);

    await fn(null, null, { run: true });
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn.mock.calls[0][0]).toMatchInlineSnapshot(`"bar"`);
    expect(mocks.spawn.mock.calls[0][1]).toMatchInlineSnapshot(`Array []`);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('shell', true);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('stdio', 'inherit');
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('env');
  });
  test(`--stdio ignore`, async () => {
    const args = '--stdio ignore foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();
    const fn = mocks.add.mock.calls[1][1];
    await fn(null, null, { run: true });

    expect(mocks.spawn).toHaveBeenCalledTimes(2);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('stdio', 'ignore');
    expect(mocks.spawn.mock.calls[1][2]).toHaveProperty('stdio', 'ignore');
  });
  test(`--stdio ignore,pipe,pipe`, async () => {
    const args = '--stdio ignore,pipe,pipe foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();
    const fn = mocks.add.mock.calls[1][1];
    await fn(null, null, { run: true });

    expect(mocks.spawn).toHaveBeenCalledTimes(2);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('stdio', [
      'ignore',
      'pipe',
      'pipe'
    ]);
    expect(mocks.spawn.mock.calls[1][2]).toHaveProperty('stdio', [
      'ignore',
      'pipe',
      'pipe'
    ]);
  });
  test(`exits w/ code 0 when not --fail`, async () => {
    const args = 'foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    mocks.options.mockClear();
    const fn = mocks.add.mock.calls[1][1];
    await fn(null, null, { run: false });
    expect(mocks.options).not.toHaveBeenCalled();
    await fn(null, null, { run: true });
    expect(mocks.options).not.toHaveBeenCalled();
    mocks.spawn.mockImplementationOnce(() => ({
      promise: Promise.reject(Error())
    }));
    await fn(null, null, { run: true });
    expect(mocks.options).not.toHaveBeenCalled();
    expect(mocks.resolver).not.toHaveBeenCalled();
  });
  test(`exits w/ code 0 when second command succeeds and --fail`, async () => {
    const args = '--fail foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    mocks.options.mockClear();
    const fn = mocks.add.mock.calls[1][1];
    await fn(null, null, { run: false });
    expect(mocks.options).not.toHaveBeenCalled();
    await fn(null, null, { run: true });
    expect(mocks.options).not.toHaveBeenCalled();
    expect(mocks.resolver).not.toHaveBeenCalled();
  });
  test(`exits w/ code 0 when second command fails and --fail`, async () => {
    const args = '--fail foo bar'.split(' ');
    await expect(main(args)).resolves.toBeUndefined();

    mocks.options.mockClear();
    mocks.spawn.mockImplementationOnce(() => ({
      promise: Promise.reject(Error())
    }));
    const fn = mocks.add.mock.calls[1][1];
    await fn(null, null, { run: true });
    expect(mocks.options).toHaveBeenCalledTimes(1);
    expect(mocks.options.mock.calls[0][0]).toHaveProperty('resolver');

    const { resolver } = mocks.options.mock.calls[0][0];
    expect(typeof resolver).toBe('function');
    expect(mocks.resolver).not.toHaveBeenCalled();

    resolver();
    expect(mocks.resolver).toHaveBeenCalledTimes(1);
    expect(mocks.resolver).toHaveBeenCalledWith('exit', 1);
  });
});
