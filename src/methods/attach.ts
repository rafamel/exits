import logger from '~/logger';
import { IAttach, TSignal } from '~/types';
import handler from '~/utils/handler';
import { SIGNALS } from '~/constants';
import store from '~/store';
import setState from '~/utils/set-state';

export const handlers = {
  signal(sig: TSignal): Promise<void> {
    return handler('signal', sig);
  },
  exception(err: Error): Promise<void> {
    return handler('exception', err);
  },
  async rejection(_: any, reason: Promise<any>): Promise<void> {
    const err = await reason.catch((e) => e);
    return handler(
      'rejection',
      err instanceof Error
        ? err
        : Error(typeof err === 'string' ? err : 'Unhandled promise rejection')
    );
  },
  exit(code: number): Promise<void> {
    return handler('exit', code);
  }
};

export function attach({
  signal = true,
  exception = true,
  rejection = true,
  exit = true
}: Partial<IAttach> = {}): void {
  const { state, process } = store;

  const update: Partial<IAttach> = {};
  if (signal && !state.attached.signal) {
    logger.debug('Attach to signal: ' + SIGNALS.join(', '));
    update.signal = true;
    SIGNALS.forEach((sig: any) => process.on(sig, handlers.signal));
  }
  if (exception && !state.attached.exception) {
    logger.debug('Attach to exception');
    update.exception = true;
    process.on('uncaughtException', handlers.exception);
  }
  if (rejection && !state.attached.rejection) {
    logger.debug('Attach to rejection');
    update.rejection = true;
    process.on('unhandledRejection', handlers.rejection);
  }
  if (exit && !state.attached.exit) {
    logger.debug('Attach to exit (beforeExit)');
    update.exit = true;
    process.on('beforeExit', handlers.exit);
  }

  if (Object.keys(update).length) {
    setState({ attached: { ...state.attached, ...update } });
  }
}

export function unattach({
  signal = true,
  exception = true,
  rejection = true,
  exit = true
}: Partial<IAttach> = {}): void {
  const { state, process } = store;

  const update: Partial<IAttach> = {};
  if (signal && state.attached.signal) {
    logger.debug('Unattach from signal: ' + SIGNALS.join(', '));
    update.signal = false;
    SIGNALS.forEach((sig: any) => process.removeListener(sig, handlers.signal));
  }
  if (exception && state.attached.exception) {
    logger.debug('Unattach from exception');
    update.exception = false;
    process.removeListener('uncaughtException', handlers.exception);
  }
  if (rejection && state.attached.rejection) {
    logger.debug('Unattach from rejection');
    update.rejection = false;
    process.removeListener('unhandledRejection', handlers.rejection);
  }
  if (exit && state.attached.exit) {
    logger.debug('Unattach from exit (beforeExit)');
    update.exit = false;
    process.removeListener('beforeExit', handlers.exit);
  }

  if (Object.keys(update).length) {
    setState({ attached: { ...state.attached, ...update } });
  }
}
