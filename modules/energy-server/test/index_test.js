let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const makeServer = require(moduleRoot);
import test from 'tape-catch';
import fetch from 'node-fetch';
import basicAuthHeader from 'basic-auth-header';

function helloName(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

function getUser(req, res, next) {
  res.send(req.user);
  next();
}

async function prepareServer() {
  const server = makeServer({publicRoutes: ['/hello/tests']});
  server.get('/hello/:name', helloName);
  server.get('/protected',getUser);

  return new Promise( resolve => {
    server.listen(8080, () => resolve(server));
  });
}


test('energy server respond', async t => {
  const server = await prepareServer();
  const res = await fetch('http://localhost:8080/hello/tests');
  const result = await res.json();
  t.equal(result, 'hello tests');
  server.close(()=>t.end());
});

async function fetchToken() {
  const res = await fetch('http://localhost:8080/token', {
    headers: {
      authorization: basicAuthHeader('testuser', 'testpwd')
    }
  });
  const result = await res.json();
  return result.token;
}

test('/auth/token return a jwt token if auth succeed', async t => {
  const server = await prepareServer();
  const token = await fetchToken();

  t.equal(typeof token, 'string');
  t.ok(token.length > 30, 'token too short');
  server.close(()=>t.end());
});

test('/auth/token return a jwt token if auth fails', async t => {
  const server = await prepareServer();

  const res = await fetch('http://localhost:8080/token', {
    headers: {
      authorization: basicAuthHeader('baduser', 'testpwd')
    }
  });
  t.equal(res.status, 403);
  server.close(()=>t.end());
});

test('/auth/token return 403 if not auth provided', async t => {
  const server = await prepareServer();

  const res = await fetch('http://localhost:8080/token');
  t.equal(res.status, 403);
  server.close(()=>t.end());
});


test('/protected return user if valid token provided', async t => {
  const server = await prepareServer();
  const token = await fetchToken();

  const res = await fetch('http://localhost:8080/protected', {
    headers: {
      authorization: `Bearer ${token}`
    }
  });
  const result = await res.json();
  t.equal(result.sub, 'testuser');
  server.close(()=>t.end());
});

test('/protected return 401 if no token provided', async t => {
  const server = await prepareServer();
  const res = await fetch('http://localhost:8080/protected');

  t.equal(res.status, 401);
  server.close(()=>t.end());
});


test('/protected return 401 if bad token provided', async t => {
  const server = await prepareServer();
  const res = await fetch('http://localhost:8080/protected', {
    headers: {
      authorization: `Bearer badftoken`
    }
  });

  t.equal(res.status, 401);
  server.close(()=>t.end());
});

