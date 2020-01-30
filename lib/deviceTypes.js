const util = require('./util');

/**
 * Returns an array of device type as strings.
 *
 * https://help.xmatters.com/xmapi/index.html#device-types
 * @param {*} env
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/device-types', query, 'Device Types');
}

exports.getMany = getMany;
