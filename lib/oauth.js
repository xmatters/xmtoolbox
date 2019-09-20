const util = require('./util');

exports.get = get;
/**
 * to get the intitial token, use this. To refresh, just call this again when needed.
 * https://help.xmatters.com/xmapi/index.html#obtain-an-access-token-and-refresh-token
 * @param {*} env
 * @param {*} query
 */
async function get(env, query) {
  return await util.request(
    env,
    `/api/xm/1/oauth2/token`,
    query,
    {},
    'oauth2 Token'
  );
}
