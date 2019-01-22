import { IOptions } from '~/types';
import store from '~/store';
import logger from '~/logger';

export default function options(opts: Partial<IOptions> = {}): void {
  store.options = {
    ...store.options,
    ...opts,
    spawned: {
      ...store.options.spawned,
      ...(opts.spawned || {})
    }
  };
  if (opts.logger) logger.setLevel(opts.logger);
}
