import gs from 'glob-stream';
import { stringify } from 'JSONStream';
import ss from 'stream-stream';
import { parseDetails, parseRecap } from 'energy-files-tojson';
import { createReadStream } from 'fs';
import map from 'through2-map';
import multipipe from 'multipipe';
import { relative } from 'path';

const formatChooser = relativeDir => file => {
  let converter = null;
  if (file.path.endsWith('.details.csv')) {
    converter = parseDetails;
  } else if (file.path.endsWith('.general.csv')) {
    converter = parseRecap;
  } else {
    this.emit(`Unknown file type ${file.path}`);
    return undefined;
  }

  return createReadStream(file.path, 'utf8')
    .pipe(converter(relative(relativeDir, file.path)));
};


export default function convertFiles(pattern, relativeDir) {
  const stream = gs.create(pattern);

  return multipipe(
    stream,
    map.obj(formatChooser(relativeDir)),
    ss({ objectMode: true }),
    stringify()
  );
}


