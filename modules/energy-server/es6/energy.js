#!/usr/bin/env node
/*eslint-disable */

require('babel-core/register');
var makeServer = require('./index');
var server = makeServer();
server.listen(9080, () => {
  process.stdout.write('server running on port 9080.\n');
});

/*eslint-enable */
