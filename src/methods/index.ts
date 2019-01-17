import deep from 'lodash.clonedeep';
import { store } from '~/store';
import { IState } from '~/types';

export { attach, unattach } from './attach';
export { default as add } from './add';
export { default as generate } from './generate';
export { default as options } from './options';
export { default as on } from './on';
export const state = (): IState => deep(store.state);
export const clear = (): void => (store.stack = []) && undefined;
