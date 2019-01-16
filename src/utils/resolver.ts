import logger from '~/logger';
import { TSignal } from '~/types';

export default function resolver(
  type: 'signal' | 'exception' | 'rejection' | 'exit',
  arg: TSignal | Error | number
): void {
  switch (type) {
    case 'signal':
      logger.debug('Killing process with signal ' + arg);
      // @ts-ignore
      process.kill(process.pid, arg);
      break;
    case 'exit':
      logger.debug('Exiting process with code ' + Number(arg));
      if (Number(arg) !== 0) process.exit(Number(arg));
      break;
    case 'exception':
    case 'rejection':
      logger.debug('Trowing error');
      setImmediate(() => {
        throw arg;
      });
      break;
    default:
      break;
  }
}
