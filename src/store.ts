import resolver from '~/utils/resolver';
import { IStore } from '~/types';

export const store: IStore = {
  stack: [],
  state: {
    triggered: null,
    done: false,
    attached: { signal: false, exception: false, rejection: false, exit: false }
  },
  subscribers: {
    triggered: [],
    done: [],
    attached: []
  },
  options: {
    resolver
  }
};
