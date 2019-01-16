import logger from '~/logger';
import { store } from '~/store';
import { IState } from '~/types';

export default function setState(update: Partial<IState>) {
  Object.entries(update).forEach(([key, value]) => {
    // @ts-ignore
    store.state[key] = value;
    if (store.subscribers.hasOwnProperty(key)) {
      // @ts-ignore
      store.subscribers[key].forEach(async (fn) => {
        try {
          await fn(value);
        } catch (e) {
          logger.error(e);
        }
      });
    }
  });
}
