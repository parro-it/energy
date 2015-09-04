let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}
import test from 'tape-catch';
import { resolve } from 'path';
import concat from 'concat-stream';
const convertFiles = require(moduleRoot);
const expected =
`[
{"type":"detail","filename":"fixtures/file.details.csv","sapr":"PVI_9988239_001","date":"2015-06-30T22:00:00.000Z","input":10.2,"output":11.3}
,
{"type":"recap","filename":"fixtures/file.general.csv","sapr":"PVI_9988239_001","name":"uno qualunque","version":3,"date":"2015-07-15T18:27:00.000Z","total":424242.42}
]
`;

test('convert details files', t => {
  const pattern = resolve(__dirname, './fixtures') + '/**/*.csv';
  const convertedStream = convertFiles(pattern, __dirname);


  convertedStream.pipe(concat(result => {
    t.equal(result, expected);
    t.end();
  }));
});
