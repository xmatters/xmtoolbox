const common = require('./common');

async function get(env, endpointId, query, planId) {
  return common.get(env, `/api/xm/1/plans/${planId}/endpoints/`, endpointId, query, 'Plan Endpoint');
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
  return common.getMany(env, `/api/xm/1/plans/${planId}/endpoints`, query, 'Plan Endpoints');
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
  return common.create(env, `/api/xm/1/plans/${planId}/endpoints`, endpoint, 'Plan Endpoint', true);
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
  return common.update(env, `/api/xm/1/plans/${planId}/endpoints`, endpoint, endpointId, 'Plan Endpoint');
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
  await common.delete(env, `/api/xm/1/plans/${planId}/endpoints`, endpointId, 'Plan Endpoint');
}

async function exportToImport(destination, planEndpoints, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;

  //xMatters Support ticket #152502. Creating and updating xMatters Endpoint types are not supported via API.
  planEndpoints = planEndpoints.filter(({ endpointType }) => endpointType !== 'XMATTERS');

  return await planEndpoints.map(planEndpoint => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      planEndpoint.plan = common.AssignParentObject(planEndpoint.plan, destinationPlans, 'name');

      if (planEndpoint.endpointType === 'XMATTERS') {
        planEndpoint.url = destination.baseUrl;
      }

      return planEndpoint;
    }
  });
}

const fields = [
  'name',
  //'url', exclude from this list.
  'trustSelfSigned',
  'preemptive',
  'authentication',
  'endpointType',
  'authenticationType'
];

async function sync(destination, sourcePlanEndpoints, destinationPlanEndpoints, options) {
  return common.syncObject(
    'Plan Endpoint',
    sourcePlanEndpoints,
    destinationPlanEndpoints,
    destination,
    ['name', 'plan'],
    fields,
    create,
    update,
    _delete,
    options,
    'plan'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
