import { IOptions, IStore } from '~/types';
import logger from '~/logger';

export default function options(
  store: IStore,
  opts: Partial<IOptions> = {}
): void {
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
