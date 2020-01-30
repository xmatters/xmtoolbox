const util = require('./util');

async function usersCSV(env, data) {
  return util.upload(env, '/uploads/users-v1', data, 'User Upload CSV');
}

async function epicZipSync(env, data) {
  return util.upload(env, '/uploads/epic-v1', data, 'EPIC ZipSync');
}

exports.usersCSV = usersCSV;
exports.epicZipSync = epicZipSync;
