import { IAttach, TSignal } from '~/types';
import store from '~/store';

export default function add(
  cb: (
    type: 'signal' | 'exception' | 'rejection' | 'exit',
    arg: TSignal | Error | number,
    context: any
  ) => Promise<any> | any,
  priority?: number | null,
  options?: Partial<IAttach>
): () => void {
  if (!priority) priority = 0;
  const opts: IAttach = Object.assign(
    { signal: true, exception: true, rejection: true, exit: true },
    options
  );

  const el = { cb, priority, on: opts };

  for (let i = 0; i < store.stack.length; i++) {
    if (priority <= store.stack[i].priority) {
      store.stack = store.stack
        .slice(0, i)
        .concat(el)
        .concat(store.stack.slice(i));
      return remove;
    }
  }
  store.stack.push(el);

  return remove;

  function remove(): void {
    for (let i = 0; i < store.stack.length; i++) {
      if (store.stack[i].cb === cb) {
        store.stack = store.stack.slice(0, i).concat(store.stack.slice(i + 1));
      }
    }
  }
}
