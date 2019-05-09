import { deferred, wait } from 'promist';
import logger from '~/utils/logger';
import store from '~/store';
import { IProcess } from '~/types';

export default async function killWait(): Promise<void> {
  const { processes, options } = store;
  const { spawned } = options;

  if (spawned.wait === 'none') return;
  const getFiltered = (): IProcess[] =>
    Object.values(processes).filter((x) => {
      switch (spawned.wait) {
        case 'bind':
          return x.running && !x.opts.detached;
        case 'detached':
          return x.running && x.opts.detached;
        default:
          return x.running;
      }
    });

  let filtered: IProcess[] = getFiltered();
  if (!filtered.length) {
    logger.debug('No processes to close');
    return;
  }

  logger.debug('Waiting for proceses to close');

  const promise = deferred();
  filtered.forEach(({ ps }) => {
    ps.on('close', () => {
      filtered = filtered.filter((x) => x.ps !== ps);
      if (!filtered.length) promise.resolve();
    });
  });

  if (spawned.sigterm !== null) {
    const sigterm = Number(spawned.sigterm) > 0 ? Number(spawned.sigterm) : 0;
    await Promise.race([promise, wait(sigterm)]);
    if (!filtered.length) return;

    logger.debug('Seding SIGTERM signal');
    filtered.forEach(({ ps }) => ps.kill('SIGTERM'));
  }

  if (spawned.sigkill !== null) {
    const sigkill = Number(spawned.sigkill) > 0 ? Number(spawned.sigkill) : 0;
    await Promise.race([promise, wait(sigkill)]);
    if (!filtered.length) return;

    logger.debug('Sending SIGKILL signal');
    filtered.forEach(({ ps }) => ps.kill('SIGKILL'));
  }

  await promise;
}
