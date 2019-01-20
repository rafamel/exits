import { IAttach, TSignal, IStore } from '~/types';

export default function add(
  store: IStore,
  cb: (
    type: 'signal' | 'exception' | 'rejection' | 'exit',
    arg: TSignal | Error | number
  ) => Promise<void> | void,
  priority?: number | null,
  {
    signal = true,
    exception = true,
    rejection = true,
    exit = true
  }: Partial<IAttach> = {}
) {
  function remove(): void {
    // tslint:disable-next-line no-shadowed-variable
    const { stack } = store;
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].cb === cb) {
        store.stack = stack.slice(0, i).concat(stack.slice(i + 1));
      }
    }
  }

  if (!priority) priority = 0;
  const { stack } = store;

  const el = { cb, priority, on: { signal, exception, rejection, exit } };

  for (let i = 0; i < stack.length; i++) {
    if (priority >= stack[i].priority) {
      store.stack = stack
        .slice(0, i)
        .concat(el)
        .concat(stack.slice(i));
      return remove;
    }
  }
  stack.push(el);

  return remove;
}
