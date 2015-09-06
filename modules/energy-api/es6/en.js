#!/usr/bin/env node

import api from './index';
import yargs from 'yargs';

const pattern = yargs.argv.pattern;
const api = energyApi({baseUrl: 'http://localhost:9080'});
await api.login('testuser', 'testpwd');
const pattern = resolve(__dirname, './fixtures') + '/**/*.csv';

const res = await api.insertFiles(pattern, __dirname);
 res.body.pipe(process.stdout);

