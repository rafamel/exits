import { IAttach, TSignal } from '~/types';
import store from '~/store';

export default function add(
  cb: (
    type: 'signal' | 'exception' | 'rejection' | 'exit',
    arg: TSignal | Error | number,
    context: any
  ) => Promise<void> | void,
  priority?: number | null,
  {
    signal = true,
    exception = true,
    rejection = true,
    exit = true
  }: Partial<IAttach> = {}
): () => void {
  function remove(): void {
    // tslint:disable-next-line no-shadowed-variable
    for (let i = 0; i < store.stack.length; i++) {
      if (store.stack[i].cb === cb) {
        store.stack = store.stack.slice(0, i).concat(store.stack.slice(i + 1));
      }
    }
  }

  if (!priority) priority = 0;

  const el = { cb, priority, on: { signal, exception, rejection, exit } };

  for (let i = 0; i < store.stack.length; i++) {
    if (priority >= store.stack[i].priority) {
      store.stack = store.stack
        .slice(0, i)
        .concat(el)
        .concat(store.stack.slice(i));
      return remove;
    }
  }
  store.stack.push(el);

  return remove;
}
