import { IState } from '~/types';
import store from '~/store';

export default function on(
  event: 'attached' | 'triggered' | 'done',
  cb: (getState: () => IState) => Promise<any> | any
): void {
  const { subscribers } = store;
  if (!subscribers.hasOwnProperty(String(event))) {
    throw Error(`Event ${event} doesn't exit on 'exits'`);
  }
  // @ts-ignore
  subscribers[event].push(cb);
}
