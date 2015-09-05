#!/usr/bin/env node
/*eslint-disable */

require('babel-core/register');
const { drainConnectionPool } = require('./model');

var makeServer = require('./index');
var server = makeServer();
server.listen(9080, () => {
  process.stdout.write('server running on port 9080.\n');
});

server.on('close', drainConnectionPool);


/*eslint-enable */
