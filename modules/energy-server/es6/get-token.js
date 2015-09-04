import jsonwebtoken from 'jsonwebtoken';
import thenify from 'thenify';
import { compare as _compare } from 'bcrypt-nodejs';
import { getUser } from './model';

const compare = thenify(_compare);

export default (secret, jwtIssuer) => async (req, res, next) => {
  const auth = req.authorization.basic;
  const failed = () => {
    res.send(403);
    next();
  };

  if (!auth || !auth.username || !auth.password) {
    return failed();
  }

  const user = await getUser(auth.username);
  if (user === null) {
    return failed();
  }

  const passwordValid = await compare(auth.password, user.password);
  if (!passwordValid) {
    return failed();
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
