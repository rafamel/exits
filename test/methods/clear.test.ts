import reset from '../reset-store';
import store from '~/store';
import { clear } from '~/index';

test(`Clears all tasks`, () => {
  reset();
  store.stack = Array(12).fill(0);

  clear();
  expect(store.stack).toHaveLength(0);
});
