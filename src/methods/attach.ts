import logger from '~/logger';
import { IAttach, TSignal, IStore } from '~/types';
import setState from '~/utils/set-state';
import handler from '~/utils/handler';

export const signals: TSignal[] = ['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGTERM'];

export const handlers = {
  signal(store: IStore, sig: TSignal): Promise<void> {
    return handler(store, 'signal', sig);
  },
  exception(store: IStore, err: Error): Promise<void> {
    return handler(store, 'exception', err);
  },
  async rejection(store: IStore, _: any, reason: Promise<any>): Promise<void> {
    const err = await reason.catch((e) => e);
    return handler(
      store,
      'rejection',
      err instanceof Error
        ? err
        : Error(
            err && String(err) ? String(err) : 'Unhandled promise rejection'
          )
    );
  },
  exit(store: IStore, code: number): Promise<void> {
    return handler(store, 'exit', code);
  }
};

export function attach(
  store: IStore,
  {
    signal = true,
    exception = true,
    rejection = false, // TODO change this default in the future
    exit = true
  }: Partial<IAttach> = {}
): void {
  const { state } = store;

  const update: Partial<IAttach> = {};
  if (signal && !store.handlers.signal) {
    logger.debug('Attach to signal: ' + signals.join(', '));
    update.signal = true;
    store.handlers.signal = handlers.signal.bind(null, store);
    signals.forEach((sig: any) =>
      process.on(sig, store.handlers.signal || (() => {}))
    );
  }
  if (exception && !store.handlers.exception) {
    logger.debug('Attach to exception');
    update.exception = true;
    store.handlers.exception = handlers.exception.bind(null, store);
    process.on('uncaughtException', store.handlers.exception);
  }
  if (rejection && !store.handlers.rejection) {
    logger.debug('Attach to rejection');
    update.rejection = true;
    store.handlers.rejection = handlers.rejection.bind(null, store);
    process.on('unhandledRejection', store.handlers.rejection);
  }
  if (exit && !store.handlers.exit) {
    logger.debug('Attach to exit (beforeExit)');
    update.exit = true;
    store.handlers.exit = handlers.exit.bind(null, store);
    process.on('beforeExit', store.handlers.exit);
  }

  if (Object.keys(update).length) {
    setState(store, { attached: { ...state.attached, ...update } });
  }
}

export function unattach(
  store: IStore,
  {
    signal = true,
    exception = true,
    rejection = true,
    exit = true
  }: Partial<IAttach> = {}
): void {
  const { state } = store;

  const update: Partial<IAttach> = {};
  if (signal && store.handlers.signal) {
    logger.debug('Unattach from signal: ' + signals.join(', '));
    update.signal = false;
    signals.forEach((sig: any) =>
      process.removeListener(sig, store.handlers.signal || (() => {}))
    );
    store.handlers.signal = null;
  }
  if (exception && store.handlers.exception) {
    logger.debug('Unattach from exception');
    process.removeListener('uncaughtException', store.handlers.exception);
    store.handlers.exception = null;
  }
  if (rejection && store.handlers.rejection) {
    logger.debug('Unattach from rejection');
    update.rejection = false;
    process.removeListener('unhandledRejection', store.handlers.rejection);
    store.handlers.rejection = null;
  }
  if (exit && store.handlers.exit) {
    logger.debug('Unattach from exit (beforeExit)');
    update.exit = false;
    process.removeListener('beforeExit', store.handlers.exit);
    store.handlers.exit = null;
  }

  if (Object.keys(update).length) {
    setState(store, { attached: { ...state.attached, ...update } });
  }
}
