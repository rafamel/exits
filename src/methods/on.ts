import { TTriggered, IAttach } from '~/types';
import store from '~/store';

export default on;

function on(event: 'attached', cb: (attached: IAttach) => void): void;
function on(event: 'triggered', cb: (triggered: TTriggered) => void): void;
function on(event: 'done', cb: (done: boolean) => void): void;
function on(
  event: 'triggered' | 'done' | 'attached',
  cb: (val: any) => void
): void {
  const { subscribers } = store;
  if (!subscribers.hasOwnProperty(String(event))) {
    throw Error(`Event ${event} doesn't exit on 'exits'`);
  }
  // @ts-ignore
  subscribers[event].push(cb);
}
