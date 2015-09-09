let moduleRoot = '../es6';
if (process.env.TEST_RELEASE) {
  moduleRoot = '../dist';
}
import test from 'tape-catch';
import { resolve } from 'path';
import concat from 'concat-stream';
const { parseFilename, pickLastVersion } = require(moduleRoot);
const convertFiles = require(moduleRoot).default;
const expected = [
  {type: 'detail', sapr: 'PVI_9988239_001', date: '2015-06-30T22:00:00.000Z', input: 10.2, output: 11.3},
  {type: 'recap',  sapr: 'PVI_9988239_001', name: 'uno qualunque', version: 3, date: '2015-07-15T18:27:00.000Z', total: 424242.42}
];

test('convert details files',  t => {
  const pattern = resolve(__dirname, './fixtures') + '/*.csv';
  const convertedStream = convertFiles(pattern, __dirname);
  convertedStream.pipe(concat(result => {
    t.equal(result[0].file, result[1].id);
    delete result[0].file;
    delete result[1].id;
    t.deepEqual(result, expected);
    t.end();
  }));
});

test('emit files counting events',  t => {
  t.plan(1);
  const pattern = resolve(__dirname, './fixtures') + '/*.csv';
  const convertedStream = convertFiles(pattern, __dirname);
  const results = [];
  convertedStream.on('filesCounting', filesCounting => {
    results.push({filesCounting});
  });
  convertedStream.on('filesCounter', filesCounter => {
    results.push({filesCounter});
    t.deepEqual(results, [
      { filesCounting: 0 },
      { filesCounting: 1 },
      { filesCounter: 2 }
    ]);
    t.end();
  });
  convertedStream.on('end', () => {});
});


test('convert details new style filenames to objects',  t => {
  const result = parseFilename('UPNR_PUNTUALE_UPN_1117375_01_201507_1_Nome dell impianto.details.csv');

  t.deepEqual(result, {
    filename: 'UPNR_PUNTUALE_UPN_1117375_01_201507_1_Nome dell impianto.details.csv',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  });
  t.end();
});

test('convert recap new style filenames to objects',  t => {
  const result = parseFilename('UPNR_PUNTUALE_UPN_1117375_01_201507_1_Nome dell impianto.general.csv');
  t.deepEqual(result, {
    filename: 'UPNR_PUNTUALE_UPN_1117375_01_201507_1_Nome dell impianto.general.csv',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'recap'
  });
  t.end();
});

test('convert details old style filenames to objects',  t => {
  const result = parseFilename('UPNR_PUNTUALE_UPN_1189246_01_201504_2.details.csv');
  t.deepEqual(result, {
    filename: 'UPNR_PUNTUALE_UPN_1189246_01_201504_2.details.csv',
    sapr: '1189246',
    period: '201504',
    version: 2,
    kind: 'details'
  });
  t.end();
});

test('convert recap old style filenames to objects',  t => {
  const result = parseFilename('UPNR_PUNTUALE_UPN_1189246_01_201504_2.general.csv');
  t.deepEqual(result, {
    filename: 'UPNR_PUNTUALE_UPN_1189246_01_201504_2.general.csv',
    sapr: '1189246',
    period: '201504',
    version: 2,
    kind: 'recap'
  });
  t.end();
});

test('return null for bad kind',  t => {
  const result = parseFilename('UPNR_PUNTUALE_UPN_1189246_01_201504_2.bad.csv');
  t.deepEqual(result, {
    filename: 'UPNR_PUNTUALE_UPN_1189246_01_201504_2.bad.csv',
    kind: 'malformed'
  });
  t.end();
});

test('return malformed kind for malformed filenames',  t => {
  const result = parseFilename('Curve_6467 (10)');
  t.deepEqual(result, {
    filename: 'Curve_6467 (10)',
    kind: 'malformed'
  });
  t.end();
});

test('group files by sapr & period',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201506',
    version: 1,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1189246',
    period: '201504',
    version: 2,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1189246',
    period: '201503',
    version: 2,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'recap'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201506',
    version: 1,
    kind: 'recap'
  }, {
    filename: 'file.txt',
    sapr: '1189246',
    period: '201504',
    version: 2,
    kind: 'recap'
  }, {
    filename: 'file.txt',
    sapr: '1189246',
    period: '201503',
    version: 2,
    kind: 'recap'
  }];

  const result = pickLastVersion(files);
  t.deepEqual(Object.keys(result), [
    '1117375-201507', '1117375-201506',
    '1189246-201504', '1189246-201503'
  ]);
  t.end();
});

test('skip malformed files',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'recap'
  }, {
    filename: 'file.txt',
    kind: 'malformed'
  }];

  const result = pickLastVersion(files);
  t.deepEqual(Object.keys(result), [
    '1117375-201507'
  ]);
  t.end();
});


test('result values are grouped in details & recap',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'recap'
  }];

  const result = pickLastVersion(files);
  t.equal(Object.keys(result).length, 1);
  t.same(result['1117375-201507'].details, files[0]);
  t.same(result['1117375-201507'].recap, files[1]);
  t.end();
});


test('skip obsolete file versions',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 3,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 3,
    kind: 'recap'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 2,
    kind: 'details'
  }];

  const result = pickLastVersion(files);
  t.equal(Object.keys(result).length, 1);
  t.same(result['1117375-201507'].details, files[1]);
  t.end();
});

test('skip file with unmatching versions between details and recap',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  }, {
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 3,
    kind: 'recap'
  }];

  const result = pickLastVersion(files);
  t.equal(Object.keys(result).length, 0);
  t.end();
});

test('skip files with only details',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'details'
  }];

  const result = pickLastVersion(files);
  t.equal(Object.keys(result).length, 0);
  t.end();
});

test('skip files with only recap',  t => {
  const files = [{
    filename: 'file.txt',
    sapr: '1117375',
    period: '201507',
    version: 1,
    kind: 'recap'
  }];

  const result = pickLastVersion(files);
  t.equal(Object.keys(result).length, 0);
  t.end();
});

