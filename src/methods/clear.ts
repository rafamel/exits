import { IStore } from '~/types';

export default function clear(store: IStore) {
  store.stack = [];
}
