let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}
const { drainConnectionPool } = require(moduleRoot + '/model');
import test from 'tape-catch';

import './energy_test.js';
import './auth_test.js';

test('close rethink connections', t => {
  drainConnectionPool();
  t.end();
});
