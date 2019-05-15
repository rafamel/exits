import store from '~/store';
import reset, { populateProcesses as populate } from '../reset-store';
import playSignal from '~/utils/play-signal';

beforeEach(() => {
  reset();
  populate();
});

describe(`spawned.signals = 'none'`, () => {
  test(`returns true`, () => {
    store.options.spawned.signals = 'none';

    expect(playSignal('SIGQUIT')).toBe(true);
  });
});

describe(`spawned.signals = 'detached'`, () => {
  test(`returns true when there are no detached processes`, () => {
    store.options.spawned.signals = 'detached';

    expect(playSignal('SIGHUP')).toBe(true);
    expect(store.processes.foo.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.bar.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.baz.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.foo.triggered).toBe(false);
    expect(store.processes.bar.triggered).toBe(false);
    expect(store.processes.baz.triggered).toBe(false);
  });
  test(`returns true when there are no running/untriggered detached processes`, () => {
    store.options.spawned.signals = 'detached';

    store.processes.foo.opts.detached = true;
    store.processes.foo.running = false;
    store.processes.baz.opts.detached = true;
    store.processes.baz.triggered = true;

    expect(playSignal('SIGHUP')).toBe(true);
    expect(store.processes.foo.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.bar.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.baz.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.foo.triggered).toBe(false);
    expect(store.processes.bar.triggered).toBe(false);
  });
  test(`returns false and kills with signal when there are running detached processes`, () => {
    store.options.spawned.signals = 'detached';

    store.processes.foo.opts.detached = true;
    store.processes.bar.opts.detached = true;
    store.processes.bar.running = false;
    store.processes.baz.opts.detached = true;
    store.processes.baz.triggered = true;

    expect(playSignal('SIGQUIT')).toBe(false);
    expect(store.processes.foo.ps.kill).toHaveBeenCalledWith('SIGQUIT');
    expect(store.processes.bar.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.baz.ps.kill).not.toHaveBeenCalled();
    expect(store.processes.foo.triggered).toBe(true);
    expect(store.processes.bar.triggered).toBe(false);
  });
});
describe(`spawned.signals = 'bind'`, () => {
  test(`returns true when there are no bind processes`, () => {
    store.options.spawned.signals = 'bind';

    store.processes.foo.opts.detached = true;
    store.processes.bar.opts.detached = true;
    store.processes.baz.opts.detached = true;

    expect(playSignal('SIGHUP')).toBe(true);
    expect(store.processes.foo.triggered).toBe(false);
    expect(store.processes.bar.triggered).toBe(false);
    expect(store.processes.baz.triggered).toBe(false);
  });
  test(`returns true when there are no running/untriggered bind processes`, () => {
    store.options.spawned.signals = 'bind';

    store.processes.foo.running = false;
    store.processes.bar.triggered = true;
    store.processes.baz.opts.detached = true;

    expect(playSignal('SIGHUP')).toBe(true);
    expect(store.processes.foo.triggered).toBe(false);
    expect(store.processes.baz.triggered).toBe(false);
  });
  test(`returns false when there are running/untriggered bind processes`, () => {
    store.options.spawned.signals = 'bind';

    store.processes.bar.opts.detached = true;

    expect(playSignal('SIGHUP')).toBe(false);
    expect(store.processes.foo.triggered).toBe(true);
    expect(store.processes.bar.triggered).toBe(false);
    expect(store.processes.baz.triggered).toBe(true);
  });
});
