const util = require('./util');

exports.get = get;
async function get(env, id, query = { embed: 'supervisors,observers' }) {
  return util.get(env, '/api/xm/1/dynamic-teams/', id, query);
}

exports.getMany = getMany;
async function getMany(env, query = { embed: 'supervisors,observers' }) {
  return await util.getMany(env, '/api/xm/1/dynamic-teams', query);
}
