const common = require('./common');

/**
 * A module related to xMatters event supressions.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#event-suppressions}
 *
 * @module eventSupressions
 */

/**
 * Get all event supressions from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-suppressed-events}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<EventSupression[]>} Array of Event Supression Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/event-suppressions', query, 'Suppressed Events');
}

exports.getMany = getMany;
