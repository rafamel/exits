import resolver from '~/utils/resolver';
import { IStore } from '~/types';

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
    resolver
  }
};
