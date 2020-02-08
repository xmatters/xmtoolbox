const common = require('./common');

/**
 * A module related to xMatters audits.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#audits}
 *
 * @module audits
 */

/**
 * Get all audit objects from a xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-event-audit-information}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Audit[]>} Array of Audit Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/audits', query, 'Audits');
}

exports.getMany = getMany;
