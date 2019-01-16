import { IAttach } from '~/types';
import { store } from '~/store';

export function add(
  cb: () => Promise<void> | void,
  priority?: number | null,
  {
    signal = true,
    exception = true,
    rejection = true,
    exit = true
  }: Partial<IAttach> = {}
): void {
  if (!priority) priority = 0;
  const { stack } = store;

  const el = { cb, priority, on: { signal, exception, rejection, exit } };

  for (let i = 0; i < stack.length; i++) {
    if (priority >= stack[i].priority) {
      store.stack = stack
        .slice(0, i)
        .concat(el)
        .concat(stack.slice(i));
      return;
    }
  }
  stack.push(el);
}

export function remove(cb: () => Promise<void> | void): void {
  const { stack } = store;
  for (let i = 0; i < stack.length; i++) {
    if (stack[i].cb === cb) {
      store.stack = stack.slice(0, i).concat(stack.slice(i + 1));
    }
  }
}
