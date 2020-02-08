const common = require('./common');

/**
 * A module related to xMatters communication plan endoints.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#plan-endpoints}
 *
 * @module planEndpoints
 */

/**
 * Get a plan endpoint from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-endpoints}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} endpointId The unique identifier (id) of the endpoint.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the plan you want to list the constants for.
 * @returns {Promise<PlanEndpoint>} Plan Endpoint Object Requested
 */
async function get(env, endpointId, query, planId) {
  return common.get(env, `/api/xm/1/plans/${planId}/endpoints/`, endpointId, query, 'Plan Endpoint');
}

/**
 * Get all plan endpoints in a plan from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-endpoints}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the plan you want to list the constants for.
 * @returns {Promise<PlanEndpoint[]>} Array of Plan Endpoint Objects Requested
 */
async function getMany(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/endpoints`, query, 'Plan Endpoints');
}

/**
 * Create a plan endpoint in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-endpoint}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {PlanEndpoint} endpoint {@link https://help.xmatters.com/xmapi/index.html#endpoint-object}
 * @param {string} planId The unique identifier (id) or name of the plan that will contain the endpoint.
 * @returns {Promise<PlanEndpoint} Plan Endpoint Object Created
 */
async function create(env, endpoint, planId) {
  return common.create(env, `/api/xm/1/plans/${planId}/endpoints`, endpoint, 'Plan Endpoint', true);
}

/**
 * Update a plan endpoint in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-endpoint}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {PlanEndpoint} endpoint {@link https://help.xmatters.com/xmapi/index.html#endpoint-object}
 * @param {string} endpointId The unique identifier (id) of the endpointv.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {string} planId The unique identifier (id) or name of the plan containing the endpoint.
 * @returns {Promise<PlanEndpoint>} Plan Endpoint Object Updated
 */
async function update(env, endpoint, endpointId, planId) {
  return common.update(env, `/api/xm/1/plans/${planId}/endpoints`, endpoint, endpointId, 'Plan Endpoint');
}

/**
 * Delete a plan endpoint in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-plan-endpoint}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} endpointId The unique identifier (id) of the endpoint to delete.
 * @param {string} planId The unique identifier (id) or name of the plan
 * @returns {Promise}
 */
async function _delete(env, endpointId, planId) {
  await common.delete(env, `/api/xm/1/plans/${planId}/endpoints`, endpointId, 'Plan Endpoint');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {PlanEndpoint} planEndpoints Array of plan endpoint objects to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
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

/**
 * The key values from the object that can be sychronized.
 */
const fields = [
  'name',
  //'url', exclude from this list.
  'trustSelfSigned',
  'preemptive',
  'authentication',
  'endpointType',
  'authenticationType'
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {PlanEndpoint[]} sourcePlanEndpoints An array of the plan endpoint objects to synchronize from the source data.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.PlanEndpoints
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
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
