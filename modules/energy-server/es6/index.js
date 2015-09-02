import restify from 'restify';
import restifyJwt from 'restify-jwt';
import getToken from './get-token';
const secret = 'very';
const jwtIssuer = 'energy';


export default function makeServer({publicRoutes = []} = {}) {
  const server = restify.createServer();
  const arePublicRoutes = {
    path: ['/token'].concat(publicRoutes)
  };
  const authorize = restifyJwt({secret}).unless(arePublicRoutes);

  server.use(restify.authorizationParser());
  server.use(authorize);
  server.get('/token', getToken(secret, jwtIssuer));

  return server;
}
