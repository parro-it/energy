import rethinkdbdash from 'rethinkdbdash';
const operationCache = [];

let _r = null;

function r() {
  if (! _r) {
    _r = rethinkdbdash({db: 'energy'});
  }
  return _r;
}


export async function drainConnectionPool() {
  if (operationCache.length > 0) {
    await r().table('energyFile').insert(
      operationCache.splice(0, operationCache.length)
    ).run();
  }
  r().getPool().drain();
}

export function getUser(username) {
  return r().table('users').get(username).run();
}

/*
    r.db('energy')
      .table('energyFile')
      .filter({type: 'recap'})
      .map(function (r) {
        return r.merge({month: r('date').split('-').slice(0,2)});
      })
      .group('sapr', 'month')
      .reduce(function(left, right) {
        return left.version > right.version ? left: right;
      }).default({version:0 })
      .ungroup()
      .map(function (r) {
        return r('reduction');
      })
*/

export function insertEnergyFile(energyFile) {
  operationCache.push(energyFile);
  if (operationCache.length < 10000) {
    if (!operationCache.timeout) {
      operationCache.timeout = setTimeout(async () => {
        if (operationCache.length === 0) {
          return;
        }

        await r().table('energyFile').insert(
          operationCache.splice(0, operationCache.length)
        ).run();

        operationCache.timeout = null;
      }, 10000);
    }

    return Promise.resolve()
      .then(()=>({cached: true, inserted: 1}));
  }

  return r().table('energyFile').insert(
    operationCache.splice(0, operationCache.length)
  ).run();
}
