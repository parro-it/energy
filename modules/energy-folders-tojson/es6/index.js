import gs from 'glob-stream';
import { stringify } from 'JSONStream';
import ss from 'stream-stream';
import { parseDetails, parseRecap } from 'energy-files-tojson';
import { createReadStream } from 'fs';
import map from 'through2-map';
import multipipe from 'multipipe';

function formatChooser(file) {
  let converter = null;
  if (file.path.endsWith('.details.csv')) {
    converter = parseDetails(file.path);
  } else if (file.path.endsWith('.general.csv')) {
    converter = parseRecap(file.path);
  } else {
    this.emit(`Unknown file type ${file.path}`);
    return undefined;
  }

  return createReadStream(file.path, 'utf8').pipe(converter);
}


export default function convertFiles(pattern) {
  const stream = gs.create(pattern);

  return multipipe(
    stream,
    map.obj(formatChooser),
    ss({ objectMode: true }),
    stringify()
  );
}


