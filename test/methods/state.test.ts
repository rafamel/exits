import reset, { cloned } from '../reset-store';
import store from '~/store';
import { state } from '~/index';

test(`returns state`, () => {
  reset();
  expect(state()).toEqual(cloned.state);
});

test(`doesn't mutate original state`, () => {
  reset();
  const x: any = state();
  x.foo = 'foo';

  expect(x).not.toEqual(cloned.state);
  // @ts-ignore
  expect(store.state.foo).toBeUndefined();
});
