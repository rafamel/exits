import { store } from '~/store';
import { TTriggered, IAttach } from '~/types';

export default function on(
  event: 'triggered',
  cb: (triggered: TTriggered) => void
): void;
export default function on(event: 'done', cb: (done: boolean) => void): void;
export default function on(
  event: 'attached',
  cb: (attached: IAttach) => void
): void;
export default function on(
  event: 'triggered' | 'done' | 'attached',
  cb: (val: any) => void
): void {
  if (store.subscribers.hasOwnProperty(String(event))) {
    // @ts-ignore
    store.subscribers[event].push(cb);
  }
}
