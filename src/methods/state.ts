import deep from 'lodash.clonedeep';
import store from '~/store';
import { IState } from '~/types';

export default function(): IState {
  return deep(store.state);
}
