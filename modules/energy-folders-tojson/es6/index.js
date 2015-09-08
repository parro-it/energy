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

function countFiles(globs, baseFolder) {
  const absGlob = resolve(baseFolder, globs);
  const opts = {
    cwd: baseFolder,
    dot: false,
    silent: true,
    nonull: false,
    cwdbase: false
  };
  return glob(absGlob, opts);
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


