import { SpawnOptions, ChildProcess } from 'child_process';

/**
 * A logging level value.
 */
export type TLogger = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type TExitType = 'signal' | 'exception' | 'rejection' | 'exit';

export type TSignal = 'SIGINT' | 'SIGHUP' | 'SIGQUIT' | 'SIGTERM';

export type TFn = (
  type: TExitType,
  arg: TSignal | Error | number,
  context: any
) => Promise<any> | any;

export interface IOptions {
  logger: TLogger;
  spawned: ISpawned;
  resolver(type: TExitType, arg: TSignal | Error | number): any;
}

export interface ISpawned {
  signals: 'all' | 'bind' | 'detached' | 'none';
  wait: 'all' | 'bind' | 'detached' | 'none';
  sigterm?: null | number;
  sigkill?: null | number;
}

export type TTriggered = null | {
  type: TExitType;
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
    fn(
      type: TExitType,
      arg: TSignal | Error | number,
      context: any
    ): Promise<void> | void;
  }>;
  subscribers: {
    attached: Array<(attached: IAttach) => Promise<any> | any>;
    triggered: Array<(triggered: TTriggered) => Promise<any> | any>;
    done: Array<(done: boolean) => Promise<any> | any>;
  };
  options: IOptions;
  process: NodeJS.Process;
  processes: {
    [key: string]: IProcess;
  };
}
