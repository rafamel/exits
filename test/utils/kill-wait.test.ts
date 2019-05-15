import store from '~/store';
import reset, { populateProcesses as populate } from '../reset-store';
import killWait from '~/utils/kill-wait';
import { wait } from 'promist';

beforeEach(() => {
  reset();
  populate();
});

const implementation = async (ev: string, cb: any): Promise<void> => {
  if (ev === 'close') {
    await wait(750);
    cb();
  }
};

test(`Returns immediately when spawned.wait = 'none'`, async () => {
  store.options.spawned.wait = 'none';

  let res;
  killWait().then(() => (res = true));
  await wait(100);
  expect(res).toBe(true);
});

test(`Returns immediately when there are no currently running processes`, async () => {
  store.options.spawned.wait = 'all';
  store.processes.foo.running = false;
  store.processes.bar.running = false;
  store.processes.baz.running = false;

  let res;
  killWait().then(() => (res = true));
  await wait(100);
  expect(res).toBe(true);
});

test(`Returns immediately when there are no running bind processes for spawned.wait = 'bind'`, async () => {
  store.options.spawned.wait = 'bind';
  store.processes.foo.opts.detached = true;
  store.processes.bar.running = false;
  store.processes.baz.running = false;

  let res;
  killWait().then(() => (res = true));
  await wait(100);
  expect(res).toBe(true);
});

test(`Returns immediately when there are no running detached processes for spawned.wait = 'detached'`, async () => {
  store.options.spawned.wait = 'detached';
  store.processes.foo.opts.detached = true;
  store.processes.foo.running = false;

  let res;
  killWait().then(() => (res = true));
  await wait(100);
  expect(res).toBe(true);
});

test(`Returns immediately when there are no running detached processes for spawned.wait = 'detached'`, async () => {
  store.options.spawned.wait = 'detached';
  store.processes.foo.opts.detached = true;
  store.processes.foo.running = false;

  let res;
  killWait().then(() => (res = true));
  await wait(100);
  expect(res).toBe(true);
});

test(`Waits for processes to close`, async () => {
  store.options.spawned.wait = 'bind';
  store.options.spawned.sigterm = 5000;
  (store.processes.foo.ps.on as any).mockImplementation(implementation);
  store.processes.bar.running = false;
  (store.processes.baz.ps.on as any).mockImplementation(implementation);

  let res;
  killWait().then(() => (res = true));

  await wait(500);
  expect(res).not.toBe(true);
  await wait(350);
  expect(res).toBe(true);
});

test(`Sends SIGTERM if not closed`, async () => {
  store.options.spawned.wait = 'bind';
  store.options.spawned.sigterm = 1500;
  store.options.spawned.sigkill = 5000;
  (store.processes.foo.ps.on as any).mockImplementation(implementation);
  store.processes.bar.running = false;
  let cb = (): void => {};
  (store.processes.baz.ps.on as any).mockImplementation((_: any, _cb: any) => {
    cb = _cb;
  });

  let res;
  killWait().then(() => (res = true));

  await wait(1000);
  expect(res).not.toBe(true);
  expect(store.processes.baz.ps.kill).not.toHaveBeenCalled();

  await wait(750);
  expect(res).not.toBe(true);
  expect(store.processes.foo.ps.kill).not.toHaveBeenCalled();
  expect(store.processes.baz.ps.kill).toHaveBeenCalledWith('SIGTERM');

  cb();
  await wait(100);
  expect(res).toBe(true);
});

test(`Sends SIGKILL if not closed`, async () => {
  store.options.spawned.wait = 'bind';
  store.options.spawned.sigterm = null;
  store.options.spawned.sigkill = 1500;
  (store.processes.foo.ps.on as any).mockImplementation(implementation);
  store.processes.bar.running = false;
  let cb = (): void => {};
  (store.processes.baz.ps.on as any).mockImplementation((_: any, _cb: any) => {
    cb = _cb;
  });

  let res;
  killWait().then(() => (res = true));

  await wait(1000);
  expect(res).not.toBe(true);
  expect(store.processes.baz.ps.kill).not.toHaveBeenCalled();

  await wait(750);
  expect(res).not.toBe(true);
  expect(store.processes.foo.ps.kill).not.toHaveBeenCalled();
  expect(store.processes.baz.ps.kill).toHaveBeenCalledWith('SIGKILL');

  cb();
  await wait(100);
  expect(res).toBe(true);
});

test(`Doesn't send signals if null`, async () => {
  store.options.spawned.wait = 'bind';
  store.options.spawned.sigterm = null;
  store.options.spawned.sigkill = null;
  (store.processes.foo.ps.on as any).mockImplementation(implementation);
  store.processes.bar.running = false;
  (store.processes.baz.ps.on as any).mockImplementation(implementation);

  let res;
  killWait().then(() => (res = true));

  await wait(1000);
  expect(res).toBe(true);
  expect(store.processes.foo.ps.kill).not.toHaveBeenCalled();
  expect(store.processes.baz.ps.kill).not.toHaveBeenCalled();
});
