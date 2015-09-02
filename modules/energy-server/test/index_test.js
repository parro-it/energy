let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const energy = require(moduleRoot);
import test from 'tape';

test('energy works', async t => {
  const result = await energy();
  t.equal(result, 42);
  t.end();
});

