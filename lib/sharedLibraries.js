const util = require('./util');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibraryId
 * @param {*} query
 */
async function get(env, sharedLibraryId, query) {
  return util.get(env, '/api/xm/1/shared-libraries/', sharedLibraryId, query, 'Shared library');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} commPlanId
 */
async function getMany(env, query, commPlanId) {
  return util.getMany(env, `/api/xm/1/plans/${commPlanId}/shared-libraries`, query, 'Shared Libraries');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibrary
 */
async function create(env, sharedLibrary) {
  return util.create(env, '/api/xm/1/shared-libraries', sharedLibrary, 'Shared Library', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibrary
 * @param {*} sharedLibraryId
 */
async function update(env, sharedLibrary, sharedLibraryId) {
  return util.update(env, '/api/xm/1/shared-libraries', sharedLibrary, sharedLibraryId, 'Shared Library');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibraryId
 */
async function _delete(env, sharedLibraryId) {
  await util.delete(env, '/api/xm/1/shared-libraries/', sharedLibraryId, 'Shared Library');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
