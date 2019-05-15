import reset from '../reset-store';
import store from '~/store';
import { control } from '~/index';
import { wait } from 'promist';

beforeEach(reset);

test(`finishes when state is not triggered`, async () => {
  const fn = control(function*() {
    let a = yield 1;
    a = yield Promise.resolve(a + 1);
    a = yield Promise.resolve(a + 2);
    return a;
  });

  await expect(fn()).resolves.toBe(4);
});

test(`takes in same args`, async () => {
  const fn = control(function*(...args) {
    return args;
  });

  await expect(fn(1, 2, 3, 4, 5)).resolves.toEqual([1, 2, 3, 4, 5]);
});

test(`Rejects and stops when state is triggered`, async () => {
  setTimeout(() => (store.state.triggered = {} as any), 500);
  const arr: boolean[] = [];
  const fn = control(function*() {
    let a = yield 1;
    yield wait(250);
    a = yield Promise.resolve(a + 1);
    arr.push(true);
    yield wait(250);
    arr.push(true);
    a = yield Promise.resolve(a + 2);
    arr.push(true);
    return a;
  });

  await expect(fn()).rejects.toThrowError();
  expect(arr).toEqual([true, true]);
});
