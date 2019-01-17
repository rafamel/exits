import { store } from '~/store';
import handler from '~/utils/handler';

export default async function exit(code: number): Promise<void> {
  if (store.state.attached && store.state.attached.exit) {
    return handler('exit', code);
  } else {
    process.exit(code);
  }
}
