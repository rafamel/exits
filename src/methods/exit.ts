import handler from '~/utils/handler';
import store from '~/store';

export default async function exit(code: number): Promise<void> {
  if (store.state.attached && store.state.attached.exit) {
    return handler('exit', code);
  }

  return store.options.resolver('exit', code);
}
