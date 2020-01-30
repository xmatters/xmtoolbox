const util = require('./util');

/**
 * to get the intitial token, use this. To refresh, just call this again when needed.
 * https://help.xmatters.com/xmapi/index.html#obtain-an-access-token-and-refresh-token
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getToken(env, query) {
  return util.request(env, `/api/xm/1/oauth2/token`, query, { method: 'POST' }, 'Get Oauth2 Token');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function refreshToken(env, query) {
  return util.request(env, `/api/xm/1/oauth2/token`, query, { method: 'POST' }, 'Refresh Oauth2 Token');
}

exports.getToken = getToken;
exports.refreshToken = refreshToken;
