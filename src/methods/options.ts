import { IOptions, IStore } from '~/types';

// TODO mode queue vs stack
// TODO 2nd Ctrl+C stops execution
// TODO Hooks timeout
export default function options(store: IStore, opts: Partial<IOptions>): void {
  Object.assign(store.options, opts);
}
