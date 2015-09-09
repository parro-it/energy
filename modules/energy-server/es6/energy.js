#!/usr/bin/env node
/*eslint-disable */

require('babel-core/register');
var drainConnectionPool  = require('./model').drainConnectionPool;

var makeServer = require('./index');
var server = makeServer();
server.listen(9080, function() {
  process.stdout.write('server running on port 9080.\n');
});

server.on('close', drainConnectionPool);


/*eslint-enable */
