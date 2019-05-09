import loglevel from 'loglevel';
import chalk, { Chalk } from 'chalk';
import { DEFAULT_LOG_LEVEL } from '~/constants';
import { TLogger } from '~/types';

const APP_NAME = 'exits';
const logger = loglevel.getLogger(`_${APP_NAME}_logger_`);

function setLevel(level: TLogger): void {
  logger.setLevel(level);
}

const colors: { [key in TLogger]?: Chalk } = {
  trace: chalk.magenta,
  debug: chalk.cyan,
  info: chalk.bold.green,
  warn: chalk.bold.yellow,
  error: chalk.bold.red
};

function prefix(level: TLogger): string {
  const color = colors[level];
  const name = level.toUpperCase();
  // Don't prefix app name when log level is 'info', 'warn', 'error';
  // don't prefix level 'info'
  if (logger.getLevel() >= 2) {
    return level === 'info' ? '' : color ? color(`${name}: `) : `${name}: `;
  }
  return (color ? color(`[${name}]`) : `[${name}]`) + ` ${APP_NAME}: `;
}

const factory = logger.methodFactory;
logger.methodFactory = (...args) => (...inner: any[]) => {
  factory.call(loglevel, ...args)(
    prefix(args[0].toLowerCase() as TLogger) + inner[0],
    ...inner.slice(1)
  );
};

// Must be set -at least once- after overwriting methodFactory
logger.setDefaultLevel(DEFAULT_LOG_LEVEL);

export { logger as default, setLevel };
