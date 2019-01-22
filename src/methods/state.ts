import deep from 'lodash.clonedeep';
import store from '~/store';

export default function() {
  return deep(store.state);
}
