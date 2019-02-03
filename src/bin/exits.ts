#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import program from 'commander';
import chalk from 'chalk';
import pify from 'pify';
import { DEFAULT_LOG_LEVEL } from '~/constants';
import { options, attach, add, spawn } from '~/index';
import Ajv from 'ajv';
import draft06 from 'ajv/lib/refs/json-schema-draft-06.json';
import logger from '~/utils/logger';
import cmdArgs from './cmd-args';

const schema = {
  type: 'object',
  required: ['stdio', 'at'],
  properties: {
    stdio: {
      type: 'array',
      items: { type: 'string', enum: ['inherit', 'pipe', 'ignore'] }
    },
    at: {
      type: 'array',
      items: { type: 'string', enum: ['signal', 'error', 'success'] }
    },
    log: {
      type: 'string',
      enum: ['trace', 'debug', 'info', 'warn', 'error', 'silent']
    }
  }
};

(async () => {
  const pkg = JSON.parse(
    await pify(fs.readFile)(path.join(__dirname, '../package.json'))
  );
  const ajv = new Ajv();
  ajv.addMetaSchema(draft06);

  const [argv, cmds] = cmdArgs(process.argv, { first: true });
  program
    .version(pkg.version)
    .description('Run a command after a main command terminates.')
    .name('exits')
    .usage('[options] -- <mainCmd> <...mainArgs> -- <afterCmd> <...afterArgs>')
    .option(
      '--stdio <stdio>',
      `\n\tstdio options to spawn children processes with.\n\tCan be inherit, pipe, ignore, or a comma separated combination for stdin,stdout,stderr.\n\tDefault: inherit.\n\tExample: --stdio pipe,inherit,inherit`
    )
    .option(
      '--at <at>',
      `\n\tIn which termination cases of the main process should the after command run.\n\tCan be signal, error, success, or a comma separated combination of those.\n\tDefault: signal,error,success.\n\tExample: --at signal,error`
    )
    .option(
      '--log <level>',
      `\n\tLogging level, one of trace, debug, info, warn, error, or silent.\n\tDefault: ${DEFAULT_LOG_LEVEL}\n\tExample: --logger info`
    )
    .option('--fail', `\n\tAlso exit with code 1 if the after command fails.`)
    .parse(argv);

  if (!cmds.length) return program.help();
  const [first, last] = cmdArgs(cmds, { first: false });
  if (!first.length) return program.help();

  const stdio = program.stdio ? program.stdio.split(',') : ['inherit'];
  const at = program.at
    ? program.at.split(',')
    : ['signal', 'error', 'success'];
  const log = program.log || DEFAULT_LOG_LEVEL;

  const valid = ajv.validate(schema, { stdio, at, log });
  if (!valid) return program.help();

  options({ logger: log, spawned: { signals: 'none', wait: 'all' } });
  attach();

  logger.info(chalk.green('Running main command: ') + first[0]);

  const { promise } = spawn(first[0], first.slice(1), {
    stdio: stdio.length === 1 ? stdio[0] : stdio
  });
  promise.catch(() => {});

  // executes first
  add(async (type, arg, context) => {
    try {
      const signal = await promise;
      context.run = signal ? at.includes('signal') : at.includes('success');
    } catch (e) {
      context.run = at.includes('error');
    }
  }, 1);
  // executes second
  add(async (type, arg, context) => {
    if (!last.length || !context.run) return;

    logger.info('\n' + chalk.green('Running last command: ') + last[0]);

    try {
      await spawn(last[0], last.slice(1), {
        stdio: stdio.length === 1 ? stdio[0] : stdio
      }).promise;
    } catch (e) {
      if (program.fail) process.exit(1);
      else throw e;
    }
  }, 0);
})();
