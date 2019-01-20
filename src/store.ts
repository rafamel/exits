import resolver from '~/utils/resolver';
import { IStore } from '~/types';
import { DEFAULT_LOG_LEVEL } from './constants';

export const store: IStore = {
  stack: [],
  state: {
    triggered: null,
    done: false,
    attached: { signal: false, exception: false, rejection: false, exit: false }
  },
  handlers: { signal: null, exception: null, rejection: null, exit: null },
  subscribers: {
    triggered: [],
    done: [],
    attached: []
  },
  options: {
    logger: DEFAULT_LOG_LEVEL,
    spawned: {
      signals: 'bind',
      wait: 'bind',
      sigterm: 5000,
      sigkill: 10000
    },
    resolver
  },
  processes: {}
};
