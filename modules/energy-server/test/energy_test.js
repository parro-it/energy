let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const makeServer = require(moduleRoot);
import test from 'tape-catch';
import fetch from 'node-fetch';
import basicAuthHeader from 'basic-auth-header';
const drainConnectionPool = require(moduleRoot + '/model').drainConnectionPool;


async function prepareServer() {
  const server = makeServer({publicRoutes: ['/hello/tests']});

  return new Promise( resolve => {
    server.listen(9080, () => resolve(server));
  });
}

async function fetchToken() {
  const res = await fetch('http://localhost:9080/token', {
    headers: {
      authorization: basicAuthHeader('testuser', 'testpwd')
    }
  });
  const result = await res.json();
  return result.token;
}


test('/protected return user if valid token provided', async t => {
  const server = await prepareServer();
  const token = await fetchToken();

  const res = await fetch('http://localhost:9080/energy/insert-bare-files', {
    method: 'post',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: `[
      {"type":"detail","filename":"fixtures/file.details.csv","sapr":"PVI_9988239_001","date":"2015-06-30T22:00:00.000Z","input":10.2,"output":11.3}
      ,
      {"type":"recap","filename":"fixtures/file.general.csv","sapr":"PVI_9988239_001","name":"uno qualunque","version":3,"date":"2015-07-15T18:27:00.000Z","total":424242.42}
    ]`

  });
  const result = await res.json();
  t.equal(result, 'testuser');
  server.close(()=>t.end());
});


test('close rethink connections', t => {
  drainConnectionPool();
  t.end();
});

