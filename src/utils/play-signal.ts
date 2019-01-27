import { TSignal } from '~/types';
import store from '~/store';

/**
 * Returns `true` if tasks should be triggered, `false` otherwise,
 * depending on options.spawned.signals, which controls
 * whether to stop listening for signals on the main process while
 * there is a spawned process running.
 */
export default function playSignal(signal: TSignal): boolean {
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
        res = false;
        x.triggered = true;
      });
  }

  if (spawned.signals === 'all' || spawned.signals === 'detached') {
    filtered
      .filter((x) => x.opts.detached)
      .forEach((x) => {
        res = false;
        x.triggered = true;
        x.ps.kill(signal);
      });
  }

  return res;
}
