const util = require('./util');

/**
 * Returns an array of all device names. deviceType
 *
 * https://help.xmatters.com/xmapi/index.html#device-names
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {Object} query 
 * 
 * **Examples:**
 *  - {deviceType:'EMAIL', at:'2018-11-02T08:00:00.000Z'}
 *  - null: include all options.
 *  - undefined: include all options
 *
 * **Default:** undefined
 *
 * **--Options--**
 *
 * **deviceType** Optional: Specifies devices of only the specified type. 
 *
 * - "ANDROID_PUSH"
 * - "APPLE_PUSH"
 * - "EMAIL"
 * - "FAX"
 * - "GENERIC"
 * - "TEXT_PAGER"
 * - "TEXT_PHONE"
 * - "VOICE"
 * - "VOICE_IVR"
 *
 * **at** Optional: A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *

 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/device-names', query, 'Device Names');
}

exports.getMany = getMany;
