import jsonwebtoken from 'jsonwebtoken';
import rethinkdbdash from 'rethinkdbdash';
const r = rethinkdbdash({db: 'energy'});

export function drainConnectionPool() {
  r.getPool().drain();
}

export default (secret, jwtIssuer) => async (req, res, next) => {
  const auth = req.authorization.basic;
  if (!auth || !auth.username) {
    res.send(403);
    return next();
  }

  const user = await r.table('users').get(auth.username).run();

  if (user === null) {
    res.send(403);
    return next();
  }

  const payload = {
    iss: jwtIssuer,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 10,
    sub: auth.username
  };
  const token = jsonwebtoken.sign(payload, secret);
  res.send({token});
};
