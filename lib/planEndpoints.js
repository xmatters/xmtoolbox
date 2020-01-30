const util = require('./util');

async function get(env, endpointId, query, planId) {
  return util.get(env, `/api/xm/1/plans/${planId}/endpoints/`, endpointId, query, 'Plan Endpoint');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-endpoints
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan to get endpoints from.
 * @param {*} query
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getMany(env, query, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/endpoints`, query, 'Plan Endpoints');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-a-plan-endpoint
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} endpoint endpoint object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} endpoint
 * @param {*} planId
 */
async function create(env, endpoint, planId) {
  return util.create(env, `/api/xm/1/plans/${planId}/endpoints`, endpoint, 'Plan Endpoint', true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-plan-endpoint
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} endpointId UUID for the endpoint to update
 * @param {*} endpoint endpoint object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} endpoint
 * @param {*} endpointId
 * @param {*} planId
 */
async function update(env, endpoint, endpointId, planId) {
  return util.update(env, `/api/xm/1/plans/${planId}/endpoints`, endpoint, endpointId, 'Plan Endpoint');
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan-endpoint
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} endpointId UUID for the endpoint to update
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} endpointId
 * @param {*} planId
 */
async function _delete(env, endpointId, planId) {
  await util.delete(env, `/api/xm/1/plans/${planId}/endpoints`, endpointId, 'Plan Endpoint');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
