import ss from 'stream-stream';
import { parseDetails, parseRecap } from 'energy-files-tojson';
import { createReadStream } from 'fs';
import map from 'through2-map';
import filter from 'through2-filter';
import multipipe from 'multipipe';
import { relative } from 'path';
import { resolve } from 'path';
import thenify from 'thenify';
import _glob from 'glob';
import { Readable } from 'stream';
import pairs from 'object-pairs';
import zip from 'zipmap';
const glob = thenify(_glob);

const formatChooser = relativeDir => file => {
  let converter = null;
  if (file.path.endsWith('.details.csv')) {
    converter = parseDetails;
  } else if (file.path.endsWith('.general.csv')) {
    converter = parseRecap;
  } else {
    process.stderr.write(`Unknown file type ${file.path}`);
    return undefined;
  }

  return createReadStream(file.path, 'utf8')
    .pipe(converter(relative(relativeDir, file.path)));
};

export function parseFilename(filename) {
  const parts = filename.split('.');
  const [, , , sapr, , period, version] = parts[0].split('_');
  const kindMap = {details: 'details', general: 'recap'};
  const kind = parts[1] in kindMap ? kindMap[parts[1]] : 'malformed';

  if (kind === 'malformed') {
    return { kind, filename };
  }

  return { sapr, period, version: Number(version), kind, filename };
}

export function pickLastVersion(files) {
  const grouped = files
    .filter(f => f.kind !== 'malformed')
    .reduce((results, f) => {
      const key = [f.sapr, f.period].join('-');
      if ( !(key in results) ) {
        results[key] = {[f.kind]: f};
      } else if (! (f.kind in results[key])) {
        results[key][f.kind] = f;
      } else if (f.version > results[key][f.kind].version) {
        results[key][f.kind] = f;
      }

      return results;
    }, {});

  return zip(pairs(grouped)
    .filter(([, value]) =>
      value.details && value.recap &&
      value.details.version === value.recap.version
    ));
}


async function countFiles(globs, baseFolder) {
  const absGlob = resolve(baseFolder, globs);
  const opts = {
    cwd: baseFolder,
    dot: false,
    silent: true,
    nonull: false,
    cwdbase: false
  };
  const files = await glob(absGlob, opts);
  const results = pairs(pickLastVersion(
    files.map(parseFilename)
  )).reduce((flattened, [, {details, recap}]) => {
    flattened.push(details.filename, recap.filename);
    return flattened;
  }, []);
  return results;
}

export default function convertFiles(pattern, relativeDir) {
  const stream = new Readable({objectMode: true});
  stream._read = () => {};
  const fileReader = map.obj(formatChooser(relativeDir));

  const filesCounter = countFiles(pattern, relativeDir);

  let files = 0;
  const results = multipipe(
    stream,
    map.obj(chunk => {
      results.emit('filesCounting', files++);
      return chunk;
    }),
    fileReader,
    filter.obj(r => !!r),
    ss({ objectMode: true })
  );

  filesCounter.then(totalFile => {
    totalFile.forEach(f => stream.push({path: f}));
    stream.push(null);
    results.emit('filesCounter', totalFile.length);
  }).catch(err => results.emit('error', err));

  return results;
}

