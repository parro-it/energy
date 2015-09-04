import rethinkdbdash from 'rethinkdbdash';
const r = rethinkdbdash({db: 'energy'});

export function drainConnectionPool() {
  r.getPool().drain();
}

export function getUser(username) {
  return r.table('users').get(username).run();
}

export function insertEnergyFile(energyFile) {
  return r.table('energyFile').insert(energyFile).run();
}
