const common = require('./common');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} data
 */
async function usersCSV(env, data) {
  return common.upload(env, '/uploads/users-v1', data, 'User Upload CSV');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} data
 */
async function epicZipSync(env, data) {
  return common.upload(env, '/uploads/epic-v1', data, 'EPIC ZipSync');
}

exports.usersCSV = usersCSV;
exports.epicZipSync = epicZipSync;
