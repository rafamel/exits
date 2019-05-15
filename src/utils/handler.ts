import logger from '~/utils/logger';
import { TSignal, TExitType } from '~/types';
import { unattach } from '~/methods/attach';
import store from '~/store';
import setState from '~/utils/set-state';
import playSignal from '~/utils/play-signal';
import killWait from '~/utils/kill-wait';

export default handler;

function handler(type: 'signal', arg: TSignal): Promise<void>;
function handler(type: 'exception' | 'rejection', arg: Error): Promise<void>;
function handler(type: 'exit', arg: number): Promise<void>;
async function handler(type: TExitType, arg: any): Promise<void> {
  try {
    if (store.state.triggered) return;

    if (type === 'signal' && !playSignal(arg)) return;

    // Update state
    await setState({ triggered: { type, arg } });

    // Wait for processes to close
    await killWait();

    const context = {};
    while (store.stack.length) {
      const element = store.stack.shift();
      if (element && element.on[type]) {
        try {
          await element.fn(type, arg, context);
        } catch (e) {
          logger.error(e);
        }
      }
    }

    // Wait for processes to close
    await killWait();
  } catch (e) {
    logger.error(e);
  }

  // Update state
  await setState({ done: true });

  // Unattach self
  unattach();

  await store.options.resolver(type, arg);
}
