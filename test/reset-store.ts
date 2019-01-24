import deep from 'lodash.clonedeep';
import store from '~/store';

export const cloned = deep({ ...store, process: null });
export default function reset() {
  // tslint:disable-next-line object-literal-shorthand
  Object.assign(store, { ...deep(cloned), process: process });
}
