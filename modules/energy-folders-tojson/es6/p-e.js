#!/usr/bin/env node

import convertFiles from './index';
import yargs from 'yargs';
import { stringify } from 'JSONStream';

const pattern = yargs.argv.pattern;
const convertedStream = convertFiles(pattern, process.cwd());
convertedStream
  .pipe(stringify())
  .pipe(process.stdout);

