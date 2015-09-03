let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const convert = require(moduleRoot);
import test from 'tape-catch';
import fromArray from 'from';
import csv from 'csv-stream';
import concat from 'concat-stream';

const sample = `IDPTOSCAMBIOVIRTUALE;DA_MISURA;EEA;EUA
PVI_9988239_001;01/07/2015 00:00:00;0;`;

const makeSample = () => fromArray(()=>sample);

import map from 'through2-map';
const parseDetails = map(
  ({IDPTOSCAMBIOVIRTUALE, DA_MISURA, EEA, EUA}) =>
  ({
    sapr: IDPTOSCAMBIOVIRTUALE,
    date: DA_MISURA,
    input: EEA,
    output: EUA
  })
);
const log = map(c=>(console.dir(c),c));

test('convert files', t => {
  makeSample()
    .pipe(csv.createStream({delimiter: ';'}))
    .pipe(log)
    .pipe(parseDetails)
    .pipe(concat({encoding: 'object'}, result => {
      console.dir(result);
      t.equal(result, 42);
      t.end();
    }));
});

