const common = require('./common');

async function get(env, constantId, query, planId) {
  return common.get(env, `/api/xm/1/plans/${planId}/constants/`, constantId, query, 'Plan Constant');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-constants
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan to get constants from.
 * @param {*} query
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getMany(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/constants`, query, 'Plan Constants');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-a-plan-constant
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} constant constant object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} constant
 * @param {*} planId
 */
async function create(env, constant, planId) {
  return common.create(env, `/api/xm/1/plans/${planId}/constants`, constant, `Plan Constant`, true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-plan-constant
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 * @param {*} constant constant object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} constant
 * @param {*} constantId
 * @param {*} planId
 */
async function update(env, constant, constantId, planId) {
  return common.update(env, `/api/xm/1/plans/${planId}/constants`, constant, constantId, 'Plan Constant');
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan-constant
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} constantId
 * @param {*} planId
 */
async function _delete(env, constantId, planId) {
  await common.delete(env, `/api/xm/1/plans/${planId}/constants`, constantId, 'Plan Constant');
}

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

const fields = ['name', 'value', 'description'];

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
