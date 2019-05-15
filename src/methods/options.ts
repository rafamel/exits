import { IOptions } from '~/types';
import store from '~/store';
import { setLevel } from '~/utils/logger';

export default function options(options: Partial<IOptions> = {}): void {
  store.options = {
    ...store.options,
    ...options,
    spawned: {
      ...store.options.spawned,
      ...(options.spawned || {})
    }
  };
  if (options.logger) setLevel(options.logger);
}
