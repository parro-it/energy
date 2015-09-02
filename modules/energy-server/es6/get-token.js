import jsonwebtoken from 'jsonwebtoken';

export default (secret, jwtIssuer) => (req, res, next) => {
  const auth = req.authorization.basic;
  if (auth && auth.username === 'testuser') {
    const payload = {
      iss: jwtIssuer,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 10,
      sub: auth.username
    };
    const token = jsonwebtoken.sign(payload, secret);
    res.send({token});
  } else {
    res.send(403);
  }
  next();
};
