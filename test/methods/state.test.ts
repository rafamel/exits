import reset, { cloned } from '../reset-store';
import store from '~/store';
import { state } from '~/index';

beforeEach(reset);

test(`returns state`, () => {
  expect(state()).toEqual(cloned.state);
});

test(`doesn't mutate original state`, () => {
  const x: any = state();
  x.foo = 'foo';

  expect(x).not.toEqual(cloned.state);
  expect((store.state as any).foo).toBeUndefined();
});
