/* eslint-disable no-console */
import { loadPackage, flags, safePairs } from 'cli-belt';
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { DEFAULT_LOG_LEVEL } from '~/constants';
import chalk from 'chalk';
import nrp from 'npm-run-path';
import logger from '~/utils/logger';
import logError from './log-error';
import { TLogger, TSignal } from '~/types';
import {
  options as setOptions,
  spawn as _spawn,
  attach,
  add,
  resolver
} from '~/index';

export default async function main(argv: string[]): Promise<void> {
  const pkg = await loadPackage(__dirname, { title: true });

  const help = indent`
    Run a command after a main command terminates.

    Usage:
      $ exits [options] [firstCmd] [lastCmd]

    Options:
      --stdio <value>     stdio options to spawn children processes with.
          Can be inherit, pipe, ignore, or a comma separated combination for stdin,stdout,stderr.
          Default: inherit.
          Example: --stdio pipe,inherit,inherit
      --at <value>        Termination cases of the first process in which the last command will run.
          Can be one of signal, error, success, or a comma separated combination of those.
          Default: signal,error,success.
          Example: --at signal,error
      --log <level>       Logging level, one of trace, debug, info, warn, error, or silent.
          Default: ${DEFAULT_LOG_LEVEL}.
          Example: --log info
      --fail <value>      Exits with code 1 if command execution fails.
          Can be one of first, last, both, or none.
          Default: both.
          Example: --fail both
      -h, --help          Show help
      -v, --version       Show version number

    Examples:
      $ exits "echo foo" "echo bar"
  `;

  const types = {
    '--stdio': String,
    '--at': String,
    '--log': String,
    '--fail': String,
    '--help': Boolean,
    '--version': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);
  if (cmd['--version']) return console.log(pkg.version || 'Unknown');
  if (cmd._.length < 2) {
    console.log(help + '\n');
    throw Error(`Two commands to run are required`);
  }
  if (cmd._.length > 2) {
    console.log(help + '\n');
    throw Error(`Only two commands are allowed to be passed`);
  }

  const options = {
    stdio: cmd['--stdio']
      ? (cmd['--stdio'].split(',').filter(Boolean) as any[])
      : (['inherit'] as any[]),
    at: cmd['--at']
      ? cmd['--at'].split(',').filter(Boolean)
      : ['signal', 'error', 'success'],
    log: (cmd['--log'] as TLogger) || DEFAULT_LOG_LEVEL,
    fail: (cmd['--fail'] || 'both') as ('first' | 'last' | 'both' | 'none')
  };

  const spawn = (cmd: string): Promise<TSignal | null> => {
    return _spawn(cmd, [], {
      shell: true,
      stdio: options.stdio.length === 1 ? options.stdio[0] : options.stdio,
      env: nrp.env()
    }).promise;
  };

  attach();
  setOptions({
    logger: options.log,
    spawned: {
      signals: 'none',
      wait: 'all'
    }
  });

  const fail = {
    first: options.fail === 'first' || options.fail === 'both',
    last: options.fail === 'last' || options.fail === 'both',
    state: {
      first: false,
      last: false
    }
  };

  logger.info(chalk.bold.green('Running: ') + cmd._[0]);
  const promise = spawn(cmd._[0]).catch((err) => {
    logError(err, !fail.first);
    fail.state.first = true;
  });

  add(0, async (type, arg, context) => {
    const signal = await promise;
    if (fail.state.first) context.run = options.at.includes('error');
    else if (signal) context.run = options.at.includes('signal');
    else context.run = options.at.includes('success');
  });
  add(1, async (type, arg, context) => {
    if (context.run) {
      logger.info('\n' + chalk.bold.green('Running: ') + cmd._[1]);
      await spawn(cmd._[1]).catch((err) => {
        logError(err, !fail.last);
        fail.state.last = true;
      });
    }

    if ((fail.first && fail.state.first) || (fail.last && fail.state.last)) {
      setOptions({ resolver: () => resolver('exit', 1) });
    }
  });
}
