const util = require('./util');

async function get(env, sharedLibraryId, query) {
  return util.get(env, '/api/xm/1/shared-libraries/', sharedLibraryId, query, 'Shared library');
}

async function getMany(env, query, commPlanId) {
  return util.getMany(
    env,
    `/api/xm/1/plans/${commPlanId}/shared-libraries`,
    query,
    'Shared Libraries'
  );
}

async function create(env, sharedLibrary) {
  return util.create(
    env,
    '/api/xm/1/shared-libraries',
    sharedLibrary,
    'Shared Library',
    true
  );
}

async function update(env, sharedLibrary, sharedLibraryId) {
  return util.update(
    env,
    '/api/xm/1/shared-libraries',
    sharedLibrary,
    sharedLibraryId,
    'Shared Library'
  );
}

async function _delete(env, sharedLibraryId) {
  await util.delete(env, '/api/xm/1/shared-libraries/', sharedLibraryId, 'Shared Library');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
