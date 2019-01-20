import logger from '~/logger';
import { TSignal, IStore } from '~/types';
import { unattach } from '~/methods/attach';
import setState from '~/utils/set-state';
import { play, killWait } from '~/methods/spawn';

export default function handler(
  store: IStore,
  type: 'signal',
  arg: TSignal
): Promise<void>;
export default function handler(
  store: IStore,
  type: 'exception' | 'rejection',
  arg: Error
): Promise<void>;
export default function handler(
  store: IStore,
  type: 'exit',
  arg: number
): Promise<void>;
export default async function handler(
  store: IStore,
  type: 'signal' | 'exception' | 'rejection' | 'exit',
  arg: any
): Promise<void> {
  try {
    if (store.state.triggered) return;

    if (type === 'signal' && !play(store, arg)) return;

    // Update state
    setState(store, { triggered: { type, arg } });

    // Wait for processes to close
    await killWait(store);

    while (store.stack.length) {
      const element = store.stack.shift();
      if (element && element.on[type]) {
        try {
          await element.cb(type, arg);
        } catch (e) {
          logger.error(e);
        }
      }
    }

    // Unattach self
    unattach(store);
    // Update state
    setState(store, { done: true });
  } catch (e) {
    logger.error(e);
  }
  await store.options.resolver(type, arg);
}
