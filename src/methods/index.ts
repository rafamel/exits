import deep from 'lodash.clonedeep';
import { store } from '~/store';
import { IState } from '~/types';
import { attach as _attach, unattach as _unattach } from './attach';
import _add from './add';
import _generate from './generate';
import _options from './options';
import _on from './on';
import _exit from './exit';

export const attach = _attach.bind(null, store);
export const unattach = _unattach.bind(null, store);
export const add = _add.bind(null, store);
export const generate = _generate.bind(null, store);
export const options = _options.bind(null, store);
export const on = _on.bind(null, store);
export const exit = _exit.bind(null, store);
export const state = (): IState => deep(store.state);
export const clear = (): void => (store.stack = []) && undefined;
