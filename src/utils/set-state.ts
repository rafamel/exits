import { IState } from '~/types';
import logger from '~/logger';
import store from '~/store';

export default function setState(update: Partial<IState>): void {
  const { state, subscribers } = store;
  Object.entries(update).forEach(([key, value]) => {
    // @ts-ignore
    state[key] = value;
    if (subscribers.hasOwnProperty(key)) {
      // @ts-ignore
      subscribers[key].forEach(async (fn) => {
        try {
          await fn(value);
        } catch (e) {
          logger.error(e);
        }
      });
    }
  });
}
