import handler from '~/utils/handler';
import store from '~/store';
import { TSignal } from '~/types';

export default terminate;

function terminate(type: 'signal', arg: TSignal): Promise<void>;
function terminate(type: 'exception' | 'rejection', arg: Error): Promise<void>;
function terminate(type: 'exit', arg: number): Promise<void>;
async function terminate(
  type: 'signal' | 'exception' | 'rejection' | 'exit',
  arg: any
): Promise<void> {
  switch (type) {
    case 'signal':
      if (store.state.attached.signal) return handler('signal', arg);
      break;
    case 'exception':
      if (store.state.attached.exception) return handler('exception', arg);
      break;
    case 'rejection':
      if (store.state.attached.rejection) return handler('rejection', arg);
      break;
    case 'exit':
      if (store.state.attached.exit) return handler('exit', arg);
      break;
    default:
      break;
  }

  return store.options.resolver(type, arg);
}
