let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}

const { parseDetails, parseRecap } = require(moduleRoot);

import test from 'tape-catch';
import fromArray from 'from';
import concat from 'concat-stream';

const details =
`IDPTOSCAMBIOVIRTUALE;DA_MISURA;EEA;EUA
PVI_9988239_001;01/07/2015 00:00:00;10.2;11.3`;

const recap =
`Impianto,NomeImpianto,CodicePSV,CodiceUP,DataValidazione,Versione,Stato,TotaleEnergia
01778899;uno qualunque;PVI_9988239_001;UPN_9988239_01;15/07/2015 20:27:00;3;F;424242,42`;

const makeSample = raw => fromArray(
  raw
    .split('\n')
    .map(s => new Buffer(s + '\n', 'utf8'))
);

test('convert details files', t => {
  makeSample(details)
    .pipe(parseDetails('anyone.csv'))
    .pipe(concat({encoding: 'object'}, result => {
      t.deepEqual(result, [{
        type: 'detail',
        filename: 'anyone.csv',
        date: '2015-06-30T22:00:00.000Z',
        input: 10.2,
        output: 11.3,
        sapr: 'PVI_9988239_001'
      }]);
      t.end();
    }));
});


test('convert recap files', t => {
  makeSample(recap)
    .pipe(parseRecap('anyone.csv'))
    .pipe(concat({encoding: 'object'}, result => {
      t.deepEqual(result, [{
        type: 'recap',
        filename: 'anyone.csv',
        date: '2015-07-15T18:27:00.000Z',
        name: 'uno qualunque',
        sapr: 'PVI_9988239_001',
        total: 424242.42,
        version: 3
      }]);
      t.end();
    }));
});

