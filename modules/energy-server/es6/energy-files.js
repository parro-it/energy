import { insertEnergyFile } from './model';
import streamBodyParser from 'restify-jsonstream-bodyparser';
// import concat from 'concat-stream';
import map from 'through2-map';
import multipipe from 'multipipe';
import through2 from 'through2';
import { stringify } from 'JSONStream';

function resolve(promisedInsertResult, enc, cb) {
  promisedInsertResult
    .then(res => {
      this.push(res);
      cb();
    })
    .catch(cb);
}


const join100Response = () => {
  let counter = 0;

  return function join(res, enc, cb) {
    if (counter++ === 1000) {
      counter = 0;
      this.push({inserted: 1000});
    }
    cb();
  };
};

export const insertBareEnergyFile = () => [
  streamBodyParser(),
  (req, res) => {
    const insertAll = multipipe(
      map.obj(insertEnergyFile),
      through2.obj(resolve),
      through2.obj(join100Response()),
      stringify(),
      res
    );

    insertAll.on('error', err => {
      process.stderr.write('Error occurred, but 200 already sent\n\n');
      process.stderr.write(err.stack);
      res.end();
    });

    res.status(200);
    req.body.pipe(insertAll);
  }
];
