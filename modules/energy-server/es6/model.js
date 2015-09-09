import rethinkdbdash from 'rethinkdbdash';
import pairs from 'object-pairs';

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

export async function saveEnergyFiles() {
  const group = r().db('energy')
    .table('energyMeasure')
    .group({index: 'file'})
    .sum(f => f('input').sub(f('output')))
    .ungroup();

  const fileTotals = r().db('energy').table('fileTotals');
  const systems = r().db('energy').table('systems');

  await fileTotals.delete().run();
  await fileTotals.insert(
    group.map(row => ({
      id: row('group'),
      total: row('reduction')
    }))
  ).run();

  const results = await r().db('energy')
    .table('energyFile')
    .eqJoin('id', fileTotals).run();

  const correct = results.filter(res => res.right.total === res.left.total);
  const wrong = results.filter(res => res.right.total !== res.left.total);
  if (wrong.length) {
    process.stderr.write(JSON.stringify(wrong, null, 4));
  }


  const existingSystems = (await systems.run()).reduce((syss, s) => {
    syss[s.id] = s;
    return syss;
  }, {});

  const allSystems = pairs(correct.reduce((syss, s) => {
    if (s.left.sapr in syss) {
      const existing = syss[s.left.sapr];
      existing.measures[s.left.id] = s.left;
    } else {
      syss[s.left.sapr] = {
        id: s.left.sapr,
        name: s.left.name,
        measures: {
          [s.left.id]: s.left
        }
      };
    }

    return syss;
  }, existingSystems)).map(([, v]) => v);

  await systems.insert(allSystems, {
    conflict: 'replace'
  }).run();

  return allSystems;
}
