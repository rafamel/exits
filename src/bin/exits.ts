#!/usr/bin/env node

import main from './main';
import { terminate, state } from '~/index';
import logError from './log-error';

main(process.argv.slice(2)).catch(async (err) => {
  if (state().triggered) return;

  logError(err);
  return terminate('exit', 1);
});
