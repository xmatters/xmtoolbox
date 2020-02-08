const common = require('./common');

/**
 * A module related to xMatters oauth.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#oauth}
 *
 * @module oauth
 */

/**
 * Get an oauth access token in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#obtain-an-access-token-and-refresh-token}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<AccessToken>} AccessToken Object Requested
 */
async function getToken(env, query) {
  return common.request(env, `/api/xm/1/oauth2/token`, query, { method: 'POST' }, 'Get Oauth2 Token');
}

/**
 * Refresh the oauth token in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#refresh-an-access-token}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<AccessToken>} AccessToken Object Requested
 */
async function refreshToken(env, query) {
  return common.request(env, `/api/xm/1/oauth2/token`, query, { method: 'POST' }, 'Refresh Oauth2 Token');
}

exports.getToken = getToken;
exports.refreshToken = refreshToken;
