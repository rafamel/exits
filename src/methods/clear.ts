import store from '~/store';

export default function clear() {
  store.stack = [];
}
