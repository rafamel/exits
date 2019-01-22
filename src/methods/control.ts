import { control as _control } from 'promist';
import store from '~/store';

export default function control<T, A extends any[]>(
  fn: (...args: A) => IterableIterator<T>
): (...args: A) => Promise<T> {
  return _control(
    () => !store.state.triggered || Error('Generate has stopped execution'),
    fn
  );
}
