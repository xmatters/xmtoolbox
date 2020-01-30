const util = require('./util');

async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/event-suppressions', query, 'Suppressed Events');
}

exports.getMany = getMany;
