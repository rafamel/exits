import logger from '~/logger';
import store from '~/store';
import { TSignal } from '~/types';

export default function resolver(
  type: 'signal' | 'exception' | 'rejection' | 'exit',
  arg: TSignal | Error | number
): void {
  const { process } = store;
  switch (type) {
    case 'signal':
      logger.debug('Killing process with signal ' + arg);
      // @ts-ignore
      return process.kill(process.pid, arg);
    case 'exit':
      logger.debug('Exiting process with code ' + Number(arg));
      return process.exit(Number(arg));
    case 'exception':
    case 'rejection':
      setImmediate(() => {
        throw arg;
      });
      return logger.debug('Trowing error');
    default:
      return logger.error('Resolver was called but type was not fitting');
  }
}
