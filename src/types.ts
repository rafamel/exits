import { SpawnOptions, ChildProcess } from 'child_process';

export interface IOptions {
  logger: TLogger;
  spawned: ISpawned;
  resolver(
    type: 'signal' | 'exception' | 'rejection' | 'exit',
    arg: TSignal | Error | number
  ): void;
}

export interface ISpawned {
  signals: 'all' | 'bind' | 'detached' | 'none';
  wait: 'all' | 'bind' | 'detached' | 'none';
  sigterm?: null | number;
  sigkill?: null | number;
}

export type TLogger = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type TSignal = 'SIGINT' | 'SIGHUP' | 'SIGQUIT' | 'SIGTERM';

export type TTriggered = null | {
  type: 'signal' | 'exception' | 'rejection' | 'exit';
  arg: TSignal | Error | number;
};

export interface IAttach {
  signal: boolean;
  exception: boolean;
  rejection: boolean;
  exit: boolean;
}
export interface IState {
  attached: IAttach;
  triggered: TTriggered;
  done: boolean;
}

export interface IProcess {
  ps: ChildProcess;
  opts: SpawnOptions;
  triggered: boolean;
  running: boolean;
}

export interface IStore {
  state: IState;
  stack: Array<{
    priority: number;
    on: IAttach;
    cb(
      type: 'signal' | 'exception' | 'rejection' | 'exit',
      arg: TSignal | Error | number
    ): Promise<void> | void;
  }>;
  subscribers: {
    attached: Array<(attached: IAttach) => void>;
    triggered: Array<(triggered: TTriggered) => void>;
    done: Array<(done: boolean) => void>;
  };
  options: IOptions;
  process: NodeJS.Process;
  processes: {
    [key: string]: IProcess;
  };
}
