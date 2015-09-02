let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const convert = require(moduleRoot);
import test from 'tape-catch';

test('convert files', async t => {
  const server = await convert();
  t.equal(server, 42);
  t.end();
});

