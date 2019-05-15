import deep from 'lodash.clonedeep';
import store from '~/store';

export const cloned = deep({ ...store, process: null });

export function populateProcesses(): void {
  store.processes = {
    foo: {
      ps: { on: jest.fn(), kill: jest.fn() } as any,
      opts: {},
      triggered: false,
      running: true
    },
    bar: {
      ps: { on: jest.fn(), kill: jest.fn() } as any,
      opts: {},
      triggered: false,
      running: true
    },
    baz: {
      ps: { on: jest.fn(), kill: jest.fn() } as any,
      opts: {},
      triggered: false,
      running: true
    }
  };
}

export default function reset(): void {
  // tslint:disable-next-line object-literal-shorthand
  Object.assign(store, { ...deep(cloned), process: process });
}
