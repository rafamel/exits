import logger from '~/logger';
import { TSignal } from '~/types';
import { unattach } from '~/methods/attach';
import { store } from '~/store';
import setState from '~/utils/set-state';

// TODO add `stop()` param in order to stop the add() flow within a task add()'ed.
export default function handler(type: 'signal', arg: TSignal): Promise<void>;
export default function handler(
  type: 'exception' | 'rejection',
  arg: Error
): Promise<void>;
export default function handler(type: 'exit', arg: number): Promise<void>;
export default async function handler(
  type: 'signal' | 'exception' | 'rejection' | 'exit',
  arg: any
): Promise<void> {
  try {
    const { state, stack } = store;
    if (state.triggered) return;

    logger.info('Handler triggered: ' + type);

    // Update state
    setState({ triggered: { type, arg } });

    while (stack.length) {
      const element = stack.shift();
      // TODO only run for element.on.hasOwnProp...
      if (!element) continue;
      try {
        await element.cb(type, arg);
      } catch (e) {
        logger.error(e);
      }
    }

    // Unattach self
    unattach();
    // Update state
    setState({ done: true });
  } catch (e) {
    logger.error(e);
  }
  await store.options.resolver(type, arg);
}
