const util = require('./util');

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-endpoints
 * @param {*} env
 * @param {*} planId UUID for the communication plan to get endpoints from.
 * @param {*} query
 */
async function getMany(env, planId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/plans/${planId}/endpoints`,
    query,
    'Plan Endpoints'
  );
}

exports.create = create;
/**
 * https://help.xmatters.com/xmapi/index.html#create-a-plan-endpoint
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} endpoint endpoint object
 */
async function create(env, planId, endpoint) {
  return await util.create(
    env,
    `/api/xm/1/plans/${planId}/endpoints`,
    endpoint,
    `Plan Endpoint ${endpoint.name}`,
    true
  );
}

exports.update = update;
/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-plan-endpoint
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} endpointId UUID for the endpoint to update
 * @param {*} endpoint endpoint object
 */
async function update(env, planId, endpointId, endpoint) {
  return await util.update(
    env,
    `/api/xm/1/plans/${planId}/endpoints`,
    endpoint,
    endpointId,
    'Plan Endpoint'
  );
}

exports.delete = _delete;
/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan-endpoint
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} endpointId UUID for the endpoint to update
 */
async function _delete(env, planId, endpointId) {
  await util.delete(
    env,
    `/api/xm/1/plans/${planId}/endpoints`,
    endpointId,
    'Plan Endpoint'
  );
}
