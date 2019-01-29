import { IState } from '~/types';
import logger from '~/utils/logger';
import store from '~/store';
import { parallel } from 'promist';

export default function setState(update: Partial<IState>): Promise<void> {
  const { state, subscribers } = store;
  return parallel.each(Object.entries(update), async ([key, value]) => {
    // @ts-ignore
    state[key] = value;
    if (subscribers.hasOwnProperty(key)) {
      // @ts-ignore
      await parallel.each(subscribers[key], async (fn) => {
        try {
          // @ts-ignore
          await fn(value);
        } catch (e) {
          logger.error(e);
        }
      });
    }
  });
}
