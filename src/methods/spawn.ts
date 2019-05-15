import { spawn as _spawn, SpawnOptions, ChildProcess } from 'child_process';
import logger from '~/utils/logger';
import { TSignal } from '~/types';
import { SIGNALS } from '~/constants';
import uuid from 'uuid/v4';
import store from '~/store';

export default spawn;

function spawn(
  cmd: string,
  args?: string[],
  options?: SpawnOptions
): { ps: ChildProcess; promise: Promise<TSignal | null> };
function spawn(
  cmd: string,
  options?: SpawnOptions
): { ps: ChildProcess; promise: Promise<TSignal | null> };
function spawn(
  cmd: string,
  ...args: any[]
): { ps: ChildProcess; promise: Promise<TSignal | null> } {
  const hasArgs = Array.isArray(args[0]);
  const inner: string[] = hasArgs ? args[0] : [];
  const options: SpawnOptions = (hasArgs ? args[1] : args[0]) || {};

  logger.debug('Running: ' + [cmd].concat(inner).join(' '));

  const id = uuid();
  const ps = _spawn(cmd, inner, options);
  store.processes[id] = {
    ps,
    opts: options,
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
