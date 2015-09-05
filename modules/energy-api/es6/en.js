#!/usr/bin/env node

import convertFiles from './index';
import yargs from 'yargs';

const pattern = yargs.argv.pattern;
const convertedStream = convertFiles(pattern, process.cwd());
convertedStream.pipe(process.stdout);

