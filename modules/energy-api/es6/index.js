import fetch from 'node-fetch';
import convertFiles from 'energy-folders-tojson';
import { Agent } from 'https';
import basicAuthHeader from 'basic-auth-header';

export default ({baseUrl} = {}) => ({
  defaults: {
    headers: {
      'content-type': 'application/json',
      // Connection: 'keep-alive'
    } /* ,
    agent: new Agent({
      keepAlive: true
    })*/
  },

  async request(url, opts = {}) {
   /* console.dir({
      url: `${baseUrl}${url}`,
      opts, defaults:
      this.defaults
    });*/

    const res = await fetch(
      `${baseUrl}${url}`,
      Object.assign({}, this.defaults, opts)
    );
    // console.log(res.status);
    return res;
  },

  async requestJson(url, opts = {}) {
    const res = await this.request(url, opts);
    return await res.json();
  },

  close() {
    delete this.defaults.headers.authorization;
    // this.defaults.agent.destroy();
  },

  async login(username, password) {
    this.defaults.headers.authorization =
      basicAuthHeader(username, password);

    const result = await this.requestJson('/token');
    this.defaults.headers.authorization = `Bearer ${result.token}`;
    return Promise.resolve(!!result.token);
  },

  async insertFiles(globs, baseFolder) {
    const res = await this.request('/energy/insert-bare-files', {
      body: convertFiles(globs, baseFolder),
      method: 'post'
    });

    return res;
  }
});
