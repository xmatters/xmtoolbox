const common = require('./common');

/**
 * A module related to xMatters communication plan constants.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#plan-constants}
 *
 * @module planConstants
 */

/**
 * Get a plan constant from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-plan-constants}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} constantId
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the plan you want to list the constants for.
 * @returns {Promise<PlanConstant>} Plan Constant Object Requested
 */
async function get(env, constantId, query, planId) {
  return common.get(env, `/api/xm/1/plans/${planId}/constants/`, constantId, query, 'Plan Constant');
}

/**
 * Get all plan constants from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-plan-constants}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the plan you want to list the constants for.
 * @returns {Promise<PlanConstant[]>} Array of Plan Constant Objects Requested
 */
async function getMany(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/constants`, query, 'Plan Constants');
}

/**
 * Create a plan constant in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-plan-constant}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {PlanConstant} constant {@link https://help.xmatters.com/xmapi/index.html#constant-object}
 * @param {string} planId The unique identifier (id) or  of the plan that will contain the constant.
 * @returns {Promise<PlanConstant>} Plan Constant Object Created
 */
async function create(env, constant, planId) {
  return common.create(env, `/api/xm/1/plans/${planId}/constants`, constant, `Plan Constant`, true);
}

/**
 * Update a plan constant in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-plan-constant}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {PlanConstant} constant {@link https://help.xmatters.com/xmapi/index.html#constant-object}
 * @param {string} constantId  The unique identifier (id) of the constant.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {string} planId The unique identifier (id) or name of the plan containing the constant.
 * @returns {Promise<PlanConstant>} Plan Constant Object Updated
 */
async function update(env, constant, constantId, planId) {
  return common.update(env, `/api/xm/1/plans/${planId}/constants`, constant, constantId, 'Plan Constant');
}

/**
 * Delete a plan constant in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-plan-constant}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} constantId The unique identifier (id) of of the constant to delete.
 * @param {string} planId The unique identifier (id) or name of the plan.
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, constantId, planId) {
  await common.delete(env, `/api/xm/1/plans/${planId}/constants`, constantId, 'Plan Constant');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {PlanConstant[]} planConstants Array of plan constant objects to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, planConstants, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;
  return await planConstants.map(planConstant => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      planConstant.plan = common.AssignParentObject(planConstant.plan, destinationPlans, 'name');

      return planConstant;
    }
  });
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = ['name', 'value', 'description'];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {PlanConstant[]} sourcePlanConstants An array of the plan constants objects to synchronize from the source data.
 * @param {PlanConstant[]} destinationPlanConstants  An array of the plan constants objects to synchronize from the destination data.
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
async function sync(destination, sourcePlanConstants, destinationPlanConstants, options) {
  return common.syncObject(
    'Plan Constant',
    sourcePlanConstants,
    destinationPlanConstants,
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
