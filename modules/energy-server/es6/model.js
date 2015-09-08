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
  return r().table('energyFile').insert(energyFile).run();
}
