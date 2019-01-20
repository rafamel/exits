import { IStore } from '~/types';
import { control as _control } from 'promist';

export default function control<T, A extends any[]>(
  store: IStore,
  fn: (...args: A) => IterableIterator<T>
): (...args: A) => Promise<T> {
  return _control(
    () => !store.state.triggered || Error('Generate has stopped execution'),
    fn
  );
}
