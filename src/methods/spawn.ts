import { spawn as _spawn, SpawnOptions, ChildProcess } from 'child_process';
import logger from '~/utils/logger';
import { TSignal } from '~/types';
import { SIGNALS } from '~/constants';
import uuid from 'uuid/v4';
import store from '~/store';

export default function spawn(
  cmd: string,
  args: string[] = [],
  opts: SpawnOptions = {}
): { ps: ChildProcess; promise: Promise<TSignal | null> } {
  logger.debug('Running: ' + [cmd].concat(args).join(' '));

  const id = uuid();
  const ps = _spawn(cmd, args, opts);
  store.processes[id] = {
    ps,
    opts,
    running: true,
    triggered: false
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
