import deep from 'lodash.clonedeep';
import store from '~/store';

export default function reset() {
  // tslint:disable-next-line object-literal-shorthand
  Object.assign(store, { ...deep(cloned), process: process });
}

export const cloned = deep({ ...store, process: null });

export function populateProcesses() {
  store.processes = {
    foo: {
      // @ts-ignore
      ps: { on: jest.fn(), kill: jest.fn() },
      opts: {},
      triggered: false,
      running: true
    },
    bar: {
      // @ts-ignore
      ps: { on: jest.fn(), kill: jest.fn() },
      opts: {},
      triggered: false,
      running: true
    },
    baz: {
      // @ts-ignore
      ps: { on: jest.fn(), kill: jest.fn() },
      opts: {},
      triggered: false,
      running: true
    }
  };
}
