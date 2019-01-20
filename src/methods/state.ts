import deep from 'lodash.clonedeep';
import { IStore } from '~/types';

export default function(store: IStore) {
  return deep(store.state);
}
