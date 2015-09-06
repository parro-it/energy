#!/usr/bin/env node

import energyApi from './index';
import yargs from 'yargs';
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
  res.on('filesCounting', () => process.stdout.write('.'));
  res.on('filesCounter', n => process.stdout.write('\nfilesCounter:' + n + '\n'));
  res.on('end', () => process.stdout.write('all files read'));
   // .pipe(stringify())
   // .pipe(process.stdout);
})().catch(err => process.stdout.write(err.stack));

