const common = require('./common');

/**
 * A module related to xMatters on-call information.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#get-on-call-summary}
 *
 * @module onCallSummary
 */

/**
 * Returns the active members of a group in their order of escalation for each shift. The maximum number of returned results per request is 1000.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-on-call-summary}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<OnCallSummary[]>} Array of On Call Sumary Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/on-call-summary/', query, 'On Call Summary');
}

exports.getMany = getMany;
