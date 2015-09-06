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
  let total = 0;
  res.on('filesCounting', progress => logUpdate(`
    progress: ${progress} of ${total}
  `));

  res.on('filesCounter', n => total = n);
  res.on('end', () => logUpdate('all files read'));
   // .pipe(stringify())
   // .pipe(process.stdout);
})().catch(err => process.stdout.write(err.stack));

