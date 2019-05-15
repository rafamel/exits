import { IAttach, TFn } from '~/types';
import store from '~/store';

export default add;

function add(
  priority: number | null | undefined,
  fn: TFn,
  options?: Partial<IAttach>
): () => void;
function add(fn: TFn, options?: Partial<IAttach>): () => void;
function add(...args: any[]): () => void {
  const hasPriority = typeof args[0] !== 'function';

  const priority: number = hasPriority ? args[0] || 0 : 0;
  const fn: TFn = hasPriority ? args[1] : args[0];
  const options: Partial<IAttach> | undefined = hasPriority ? args[2] : args[1];

  const opts: IAttach = Object.assign(
    { signal: true, exception: true, rejection: true, exit: true },
    options
  );

  const el = { fn, priority, on: opts };

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
      if (store.stack[i].fn === fn) {
        store.stack = store.stack.slice(0, i).concat(store.stack.slice(i + 1));
      }
    }
  }
}
