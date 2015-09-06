import { drainConnectionPool } from 'energy-server';
import test from 'tape-catch';

import './insertFiles_test.js';

test('close rethink connections', t => {
  drainConnectionPool();
  t.end();
});
