import resolver from '~/utils/resolver';
import { IStore } from '~/types';
import { DEFAULT_LOG_LEVEL } from './constants';

const store: IStore = {
  stack: [],
  state: {
    attached: {
      signal: false,
      exception: false,
      rejection: false,
      exit: false
    },
    triggered: null,
    done: false
  },
  subscribers: {
    attached: [],
    triggered: [],
    done: []
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
  process: process,
  processes: {}
};

export default store;
