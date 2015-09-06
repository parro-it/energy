let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}


import test from 'tape-catch';
import { resolve } from 'path';
import makeServer from 'energy-server';
// import concat from 'concat-stream';
const energyApi = require(moduleRoot);

async function prepareServer() {
  const server = makeServer();
  return new Promise( res => {
    server.listen(9080, () => res(server));
  });
}

test('add details files', async t => {
  const server = await prepareServer();
  const api = energyApi({baseUrl: 'http://localhost:9080'});
  await api.login('testuser', 'testpwd');
  const pattern = resolve(__dirname, './fixtures') + '/**/*.csv';

  const res = await api.insertFiles(pattern, __dirname);
  const results = await res.json();
  results.forEach(r =>
    t.ok(Array.isArray(r.generated_keys))
  );
  results.forEach(r => delete r.generated_keys);

  t.deepEqual(results, [{
    deleted: 0,
    errors: 0,
    inserted: 1,
    replaced: 0,
    skipped: 0,
    unchanged: 0
  }, {
    deleted: 0,
    errors: 0,
    inserted: 1,
    replaced: 0,
    skipped: 0,
    unchanged: 0
  }]);

  api.close();
  server.close(()=> {
    t.end();
  });
});
