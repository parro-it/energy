#!/usr/bin/env node

import energyApi from './index';
import yargs from 'yargs';
import logUpdate from 'log-update';
// import { stringify } from 'JSONStream';

const {
  pattern,
  baseUrl,
  username,
  password
} = yargs.argv;

(async () => {
  const api = energyApi({baseUrl});
  await api.login(username, password);

  const res = await api.insertFiles(pattern, process.cwd());
  res.on('filesCounting', (progress, perc) => logUpdate(`
    uploading files: ${progress} (${perc}%)
  `));

  res.on('end', () => logUpdate('all files read'));
})().catch(err => process.stdout.write(err.stack));

