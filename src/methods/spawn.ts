import chalk from 'chalk';
import { spawn as _spawn, SpawnOptions, ChildProcess } from 'child_process';
import logger from '~/logger';
import { TSignal, IProcess } from '~/types';
import { SIGNALS } from '~/constants';
import uuid from 'uuid/v4';
import { deferred, timeout } from 'promist';
import store from '~/store';

/**
 * Returns `true` if tasks should triggered, `false` otherwise.
 */
export function play(signal: TSignal): boolean {
  const { processes, options } = store;
  const { spawned } = options;

  if (spawned.signals === 'none') return true;

  let res = true;
  const filtered = Object.values(processes).filter(
    (x) => x.running && !x.triggered
  );

  if (spawned.signals === 'all' || spawned.signals === 'bind') {
    filtered
      .filter((x) => !x.opts.detached)
      .forEach((x) => {
        if (res) res = false;
        x.triggered = true;
      });
  }

  if (spawned.signals === 'all' || spawned.signals === 'detached') {
    filtered
      .filter((x) => x.opts.detached)
      .forEach((x) => {
        if (res) res = false;
        x.triggered = true;
        x.ps.kill(signal);
      });
  }

  return res;
}

export async function killWait(): Promise<void> {
  const { processes, options } = store;
  const { spawned } = options;

  if (spawned.wait === 'none') return;
  const getFiltered = () =>
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

  // TODO take into account incoming proccesses (we need to also listen on
  // close for processes starting after)
  const p = deferred();
  filtered.forEach(({ ps }) => {
    ps.on('close', () => {
      filtered = filtered.filter((x) => x.ps !== ps);
      if (!filtered.length) p.resolve();
    });
  });

  if (spawned.sigterm !== null) {
    await timeout(
      Number(spawned.sigterm) > 0 ? Number(spawned.sigterm) : 0,
      Error()
    )(p.then((x) => x)).catch(() => {});
    if (!filtered.length) return;

    logger.debug('Seding SIGTERM signal');
    filtered.forEach(({ ps }) => ps.kill('SIGTERM'));
  }

  if (spawned.sigkill !== null) {
    await timeout(
      Number(spawned.sigkill) > 0 ? Number(spawned.sigkill) : 0,
      Error()
    )(p.then((x) => x)).catch(() => {});
    if (!filtered.length) return;
    logger.debug('Sending SIGKILL signal');
  }

  return p;
}

export default function spawn(
  cmd: string,
  args: string[] = [],
  opts: SpawnOptions = {}
): { ps: ChildProcess; promise: Promise<TSignal | null> } {
  logger.debug(
    chalk.green('\nRunning: ') + [cmd].concat(args || []).join(' ') + '\n'
  );

  const id = uuid();
  const ps = _spawn(cmd, args, opts);
  store.processes[id] = {
    ps,
    opts,
    triggered: false,
    running: true
  };

  return {
    ps,
    promise: new Promise((resolve, reject) => {
      ps.on('error', (err) => {
        reject(err);
      });
      ps.on('close', (code, signal: TSignal) => {
        store.processes[id].running = false;
        code || (signal && !SIGNALS.includes(signal))
          ? reject(Error(`Process failed (${code || signal}): ${cmd}`))
          : resolve(signal || null);
      });
    })
  };
}
