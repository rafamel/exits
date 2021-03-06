import reset from '../reset-store';
import store from '~/store';
import { add } from '~/index';

beforeEach(reset);

test(`Adds element to store`, () => {
  const el = (): void => {};

  add(el);

  expect(store.stack).toHaveLength(1);
  expect(store.stack[0].fn).toBe(el);
});

test(`Adds with default values`, () => {
  add(() => {});
  expect(store.stack[0].on).toEqual({
    signal: true,
    exception: true,
    rejection: true,
    exit: true
  });
  expect(store.stack[0].priority).toBe(0);
});

test(`Priority is 0 for null | undefined`, () => {
  add(() => {});
  add(null, () => {});
  add(undefined, () => {});

  expect(store.stack).toHaveLength(3);
  expect(store.stack[0].priority).toBe(0);
  expect(store.stack[1].priority).toBe(0);
  expect(store.stack[2].priority).toBe(0);
});

test(`Adds with custom priority`, () => {
  add(-1, () => {});
  expect(store.stack[0].priority).toBe(-1);
});

test(`Adds with custom priority & attachments`, () => {
  add(1, () => {}, { exception: false, rejection: true, exit: false });
  expect(store.stack[0].priority).toBe(1);
  expect(store.stack[0].on).toEqual({
    signal: true,
    exception: false,
    rejection: true,
    exit: false
  });
});

test(`Adds elements in reverse order`, () => {
  const el1 = (): void => {};
  const el2 = (): void => {};

  add(el1);
  add(el2);

  expect(store.stack).toHaveLength(2);
  expect(store.stack[0].fn).toBe(el2);
  expect(store.stack[1].fn).toBe(el1);
});

test(`Adds elements in priority order`, () => {
  const els = Array(12)
    .fill(0)
    .map(() => () => {});

  add(-5, els[0]);
  add(0, els[1]);
  add(-2, els[2]);
  add(2, els[3]);
  add(3, els[4]);
  add(els[5]);
  add(-1, els[6]);
  add(0, els[7]);
  add(1, els[8]);
  add(els[9]);
  add(3, els[10]);
  add(-5, els[11]);

  expect(store.stack).toHaveLength(12);
  expect(store.stack.map((x) => x.fn)).toEqual([
    els[11],
    els[0],
    els[2],
    els[6],
    els[9],
    els[7],
    els[5],
    els[1],
    els[8],
    els[3],
    els[10],
    els[4]
  ]);
});

test(`Removes elements`, () => {
  const els = Array(8)
    .fill(0)
    .map(() => () => {});

  add(-5, els[0]);
  const a = add(0, els[1]);
  add(-2, els[2]);
  const b = add(2, els[3]);
  add(3, els[4]);
  add(els[5]);
  const c = add(-1, els[6]);
  add(0, els[7]);

  expect(store.stack).toHaveLength(8);
  a();
  expect(store.stack).toHaveLength(7);
  b();
  expect(store.stack).toHaveLength(6);
  c();
  expect(store.stack).toHaveLength(5);
  expect(store.stack.map((x) => x.fn)).toEqual([
    els[0],
    els[2],
    els[7],
    els[5],
    els[4]
  ]);
});
