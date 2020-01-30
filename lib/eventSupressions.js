const util = require('./util');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/event-suppressions', query, 'Suppressed Events');
}

exports.getMany = getMany;
