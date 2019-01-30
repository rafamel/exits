import { SpawnOptions, ChildProcess } from 'child_process';
import { LogLevelDesc } from 'loglevel';

export type TLogger = LogLevelDesc;

export interface IOptions {
  logger: TLogger;
  spawned: ISpawned;
  resolver(
    type: 'signal' | 'exception' | 'rejection' | 'exit',
    arg: TSignal | Error | number
  ): any;
}

export interface ISpawned {
  signals: 'all' | 'bind' | 'detached' | 'none';
  wait: 'all' | 'bind' | 'detached' | 'none';
  sigterm?: null | number;
  sigkill?: null | number;
}

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
  running: boolean;
  triggered: boolean;
}

export interface IStore {
  state: IState;
  stack: Array<{
    priority: number;
    on: IAttach;
    cb(
      type: 'signal' | 'exception' | 'rejection' | 'exit',
      arg: TSignal | Error | number,
      context: any
    ): Promise<void> | void;
  }>;
  subscribers: {
    attached: Array<(attached: IAttach) => any>;
    triggered: Array<(triggered: TTriggered) => any>;
    done: Array<(done: boolean) => any>;
  };
  options: IOptions;
  process: NodeJS.Process;
  processes: {
    [key: string]: IProcess;
  };
}
