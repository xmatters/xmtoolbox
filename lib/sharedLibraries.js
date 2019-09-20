const util = require('./util');

exports.get = get;
async function get(env, id) {
  return util.get(env, '/api/xm/1/shared-libraries/', id);
}

exports.getMany = getMany;
async function getMany(env, commPlanId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/plans/${commPlanId}/shared-libraries`,
    query
  );
}

exports.create = create;
async function create(env, sharedLibrary) {
  return await util.create(
    env,
    '/api/xm/1/shared-libraries',
    sharedLibrary,
    `Shared Library ${sharedLibrary.name}`,
    true
  );
}

exports.update = update;
async function update(env, id, sharedLibrary) {
  return await util.update(
    env,
    '/api/xm/1/shared-libraries',
    sharedLibrary,
    id,
    'Shared Library'
  );
}
