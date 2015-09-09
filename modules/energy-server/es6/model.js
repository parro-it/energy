import rethinkdbdash from 'rethinkdbdash';

let _r = null;

function r() {
  if (! _r) {
    _r = rethinkdbdash({db: 'energy'});
  }
  return _r;
}

export async function drainConnectionPool() {
  r().getPool().drain();
}

export function getUser(username) {
  return r().table('users').get(username).run();
}

export function insertEnergyFile(energyFile) {
  const tableName = energyFile.type === 'recap' ? 'energyFile' : 'energyMeasure';
  return r().table(tableName).insert(energyFile).run();
}
