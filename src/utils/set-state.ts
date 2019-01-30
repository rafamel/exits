import { IState } from '~/types';
import logger from '~/utils/logger';
import store from '~/store';
import { parallel } from 'promist';
import getState from '~/methods/state';

let promise = Promise.resolve();
export default function setState(update: Partial<IState>): Promise<void> {
  const { state, subscribers } = store;
  // @ts-ignore
  Object.entries(update).forEach(([key, value]) => (state[key] = value));
  // This accumulated promise allows us to keep attach() and unattach() synchronous
  promise = promise.then(() => {
    return parallel.each(Object.keys(update), async (key) => {
      if (subscribers.hasOwnProperty(key)) {
        logger.debug('Running ' + key + ' event hooks');
        await parallel.each(
          // @ts-ignore
          subscribers[key],
          async (fn: (getState: () => IState) => Promise<any> | any) => {
            try {
              await fn(getState);
            } catch (e) {
              logger.error(e);
            }
          }
        );
      }
    });
  });
  return promise;
}
