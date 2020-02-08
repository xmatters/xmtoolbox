const common = require('./common');

/**
 * A module related to xMatters upload functionality.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#upload-users}
 *
 * @module uploads
 */

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} data
 */
async function usersCSV(env, data) {
  return common.upload(env, '/uploads/users-v1', data, 'User Upload CSV');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} data
 */
async function epicZipSync(env, data) {
  return common.upload(env, '/uploads/epic-v1', data, 'EPIC ZipSync');
}

exports.usersCSV = usersCSV;
exports.epicZipSync = epicZipSync;
