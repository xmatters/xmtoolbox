const common = require('./common');

/**
 * A module related to xMatters Device Names.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#device-names}
 *
 * @module deviceNames
 */

/**
 *Get all device names from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-device-names}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Object[]>} Array of DeviceName Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/device-names', query, 'Device Names');
}

exports.getMany = getMany;
