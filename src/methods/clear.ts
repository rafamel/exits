import store from '~/store';

export default function clear(): void {
  store.stack = [];
}
