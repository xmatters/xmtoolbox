const common = require('./common');

/**
 * A module related to xMatters upload functionality.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#upload-users}
 *
 * @module uploads
 */

/**
 * Upload Users CSV file to xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#upload-a-user-upload-file}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} data Form-Data object to upload. Contains file and name properties.
 * @returns {Promise<ImportJob>} Import Job Object Created
 */
async function usersCSV(env, data) {
  return common.upload(env, '/uploads/users-v1', data, 'User Upload CSV');
}

/**
 * Upload xMatters ZipSync to xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#upload-an-epic-zipsync-file}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} data Form-Data object to upload. Contains file property.
 * @returns {Promise<ImportJob>} Import Job Object Created
 */
async function epicZipSync(env, data) {
  return common.upload(env, '/uploads/epic-v1', data, 'EPIC ZipSync');
}

exports.usersCSV = usersCSV;
exports.epicZipSync = epicZipSync;
