const common = require('./common');

/**
 * A module related to xMatters device types.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#device-types}
 *
 * @module deviceTypes
 */

/**
 * Get all device types from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-device-types}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<DeviceType[]>} Array strings for the Device Types Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/device-types', query, 'Device Types');
}

exports.getMany = getMany;
