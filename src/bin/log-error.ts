import { ensure } from 'errorish';
import logger from '~/utils/logger';

export default function logError(error: Error, warn?: boolean): void {
  const err = ensure(error);
  logger[warn ? 'warn' : 'error'](err.message);
  logger.trace(err.stack);
}
