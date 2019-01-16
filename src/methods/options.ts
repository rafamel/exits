import { store } from '~/store';
import { IOptions } from '~/types';

// TODO mode queue vs stack
// TODO 2nd Ctrl+C stops execution
// TODO Hooks timeout
export default function options(opts: Partial<IOptions>): void {
  Object.assign(store.options, opts);
}
