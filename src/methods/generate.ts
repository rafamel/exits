import { store } from '~/store';

export default function generate<T, A extends any[]>(
  fn: (...args: A) => IterableIterator<T>
): (...args: A) => Promise<T> {
  return async (...args: A): Promise<T> => {
    const iterator = fn(...args);
    let value;
    let done;

    while (!done && !store.state.triggered) {
      const next: { value: any; done: boolean } = iterator.next(await value);
      value = next.value;
      done = next.done;
    }

    if (store.state.triggered) {
      throw Error('Generate has stopped execution for ' + fn.name);
    }

    return value;
  };
}
