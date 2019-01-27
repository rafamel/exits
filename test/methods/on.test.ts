import reset from '../reset-store';
import store from '~/store';
import { on } from '~/index';

test(`adds subscribers`, () => {
  reset();

  const cbs = [() => {}, () => {}, () => {}];
  on('attached', cbs[0]);
  on('triggered', cbs[1]);
  on('done', cbs[2]);

  expect(store.subscribers.attached).toEqual([cbs[0]]);
  expect(store.subscribers.triggered).toEqual([cbs[1]]);
  expect(store.subscribers.done).toEqual([cbs[2]]);
});

test(`adds multiple subscribers`, () => {
  reset();

  const cbs = Array(9)
    .fill(0)
    .map(() => () => {});

  on('attached', cbs[0]);
  on('triggered', cbs[1]);
  on('done', cbs[2]);
  on('attached', cbs[3]);
  on('triggered', cbs[4]);
  on('done', cbs[5]);
  on('attached', cbs[6]);
  on('triggered', cbs[7]);
  on('done', cbs[8]);

  expect(store.subscribers.attached).toEqual([cbs[0], cbs[3], cbs[6]]);
  expect(store.subscribers.triggered).toEqual([cbs[1], cbs[4], cbs[7]]);
  expect(store.subscribers.done).toEqual([cbs[2], cbs[5], cbs[8]]);
});

test(`throws on bad event`, () => {
  reset();

  // @ts-ignore
  expect(() => on('nonevent', () => {})).toThrowError();
});
