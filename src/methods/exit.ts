import handler from '~/utils/handler';
import { IStore } from '~/types';

export default async function exit(store: IStore, code: number): Promise<void> {
  if (store.state.attached && store.state.attached.exit) {
    return handler(store, 'exit', code);
  } else {
    process.exit(code);
  }
}
