const util = require('./util');

/**
 * Returns an array of device type as strings.
 *
 * https://help.xmatters.com/xmapi/index.html#device-types
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/device-types', query, 'Device Types');
}

exports.getMany = getMany;
