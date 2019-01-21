import { TTriggered, IAttach, IStore } from '~/types';

export default function on(
  store: IStore,
  event: 'attached',
  cb: (attached: IAttach) => void
): void;
export default function on(
  store: IStore,
  event: 'triggered',
  cb: (triggered: TTriggered) => void
): void;
export default function on(
  store: IStore,
  event: 'done',
  cb: (done: boolean) => void
): void;
export default function on(
  store: IStore,
  event: 'triggered' | 'done' | 'attached',
  cb: (val: any) => void
): void {
  if (!store.subscribers.hasOwnProperty(String(event))) {
    throw Error(`Event ${event} doesn't exit on 'exits'`);
  }
  // @ts-ignore
  store.subscribers[event].push(cb);
}
