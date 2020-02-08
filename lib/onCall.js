const common = require('./common');

/**
 * A module related to xMatters on-call information.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#on-call}
 *
 * @module onCalls
 */

/**
 * Get who is on call from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-who-is-on-call}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<OnCall[]>} Array of On Call Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/on-call/', query, 'On Call');
}

exports.getMany = getMany;
