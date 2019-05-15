import _reset from '../reset-store';
import { spawn } from '~/index';
import { spawn as __spawn } from 'child_process';
import { wait, isPromise } from 'promist';
import store from '~/store';

jest.mock('child_process');
const _spawn: any = __spawn;

beforeEach(() => {
  _reset();
  _spawn.mockReset();
  _spawn.mockImplementation(() => ({
    on: jest.fn((ev, cb) => {
      if (ev === 'close') cb(0);
    })
  }));
});

test(`Calls node spawn, returns child process and promise`, () => {
  const obj = spawn('echo', ['1'], { stdio: 'ignore' });

  expect(_spawn).toBeCalledWith('echo', ['1'], { stdio: 'ignore' });
  expect(obj).toHaveProperty('ps');
  expect(obj).toHaveProperty('promise');

  const { ps, promise } = obj;
  expect(ps).toHaveProperty('on');
  expect(isPromise(promise)).toBe(true);
});

test(`Sets defaults for optional params`, () => {
  spawn('echo');
  expect(_spawn).toBeCalledWith('echo', [], {});
});

test(`Adds processes to store and sets running to false and resolves on exit code 0`, async () => {
  _spawn.mockImplementation(() => ({
    on: jest.fn((ev, cb) => {
      if (ev === 'close') wait(500).then(() => cb(0));
    })
  }));

  expect(Object.keys(store.processes)).toHaveLength(0);

  const { promise: p1 } = spawn('echo', ['1'], { stdio: 'ignore' });
  let res1;
  p1.then(() => (res1 = true));
  expect(Object.keys(store.processes)).toHaveLength(1);

  const id1 = Object.keys(store.processes)[0];
  expect(store.processes[id1].running).toBe(true);
  expect(res1).not.toBe(true);

  await wait(250);
  const { promise: p2 } = spawn('echo', ['1'], { stdio: 'ignore' });
  let res2;
  p2.then(() => (res2 = true));
  expect(Object.keys(store.processes)).toHaveLength(2);
  const id2 = Object.keys(store.processes).filter((x) => x !== id1)[0];
  expect(res1).not.toBe(true);

  await wait(250);
  expect(store.processes[id1].running).toBe(false);
  expect(res1).toBe(true);
  expect(res2).not.toBe(true);

  await wait(250);
  expect(store.processes[id2].running).toBe(false);
  expect(res2).toBe(true);
});

test(`Rejects on error`, async () => {
  const err = Error();
  _spawn.mockImplementation(() => ({
    on: jest.fn((ev, cb) => {
      if (ev === 'error') cb(err);
    })
  }));

  const { promise } = spawn('echo', ['1'], { stdio: 'ignore' });

  await expect(promise).rejects.toThrowError(err);
});

test(`Rejects on unknown signal`, async () => {
  _spawn.mockImplementation(() => ({
    on: jest.fn((ev, cb) => {
      if (ev === 'close') cb(undefined, 'UNKNOWN_SIGNAL');
    })
  }));

  const { promise } = spawn('echo', ['1'], { stdio: 'ignore' });

  await expect(promise).rejects.toThrowError();
});

test(`Rejects on exit code 1`, async () => {
  _spawn.mockImplementation(() => ({
    on: jest.fn((ev, cb) => {
      if (ev === 'close') cb(1);
    })
  }));

  const { promise } = spawn('echo', ['1'], { stdio: 'ignore' });

  await expect(promise).rejects.toThrowError();
});
