import reset from '../reset-store';
import store from '~/store';
import { add } from '~/index';

test(`Adds element to store`, () => {
  reset();
  const el = () => {};

  add(el);

  expect(store.stack).toHaveLength(1);
  expect(store.stack[0].cb).toBe(el);
});

test(`Adds with default values`, () => {
  reset();

  add(() => {});
  expect(store.stack[0].on).toEqual({
    signal: true,
    exception: true,
    rejection: true,
    exit: true
  });
  expect(store.stack[0].priority).toBe(0);
});

test(`Priority is 0 for null`, () => {
  reset();

  add(() => {}, null);
  expect(store.stack[0].priority).toBe(0);
});

test(`Adds with custom priority`, () => {
  reset();

  add(() => {}, -1);
  expect(store.stack[0].priority).toBe(-1);
});

test(`Adds with custom priority & attachments`, () => {
  reset();

  add(() => {}, 1, { exception: false, rejection: true, exit: false });
  expect(store.stack[0].priority).toBe(1);
  expect(store.stack[0].on).toEqual({
    signal: true,
    exception: false,
    rejection: true,
    exit: false
  });
});

test(`Adds elements in reverse order`, () => {
  reset();
  const el1 = () => {};
  const el2 = () => {};

  add(el1);
  add(el2);

  expect(store.stack).toHaveLength(2);
  expect(store.stack[0].cb).toBe(el2);
  expect(store.stack[1].cb).toBe(el1);
});

test(`Adds elements in priority order`, () => {
  reset();
  const els = Array(12)
    .fill(0)
    .map(() => () => {});

  add(els[0], -5);
  add(els[1], 0);
  add(els[2], -2);
  add(els[3], 2);
  add(els[4], 3);
  add(els[5]);
  add(els[6], -1);
  add(els[7], 0);
  add(els[8], 1);
  add(els[9]);
  add(els[10], 3);
  add(els[11], -5);

  expect(store.stack).toHaveLength(12);
  expect(store.stack.map((x) => x.cb)).toEqual([
    els[10],
    els[4],
    els[3],
    els[8],
    els[9],
    els[7],
    els[5],
    els[1],
    els[6],
    els[2],
    els[11],
    els[0]
  ]);
});

test(`Removes elements`, () => {
  reset();
  const els = Array(8)
    .fill(0)
    .map(() => () => {});

  add(els[0], -5);
  const a = add(els[1], 0);
  add(els[2], -2);
  const b = add(els[3], 2);
  add(els[4], 3);
  add(els[5]);
  const c = add(els[6], -1);
  add(els[7], 0);

  expect(store.stack).toHaveLength(8);
  a();
  expect(store.stack).toHaveLength(7);
  b();
  expect(store.stack).toHaveLength(6);
  c();
  expect(store.stack).toHaveLength(5);
  expect(store.stack.map((x) => x.cb)).toEqual([
    els[4],
    els[7],
    els[5],
    els[2],
    els[0]
  ]);
});