const common = require('./common');

/**
 * https://help.xmatters.com/xmapi/index.html#get-a-communication-plan
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} query
 *
 * **Examples:**
 * - {embed: 'creator,constants,endpoints,forms,propertyDefinitions,integrations'}
 * - {at: '2019-01-13T20:07:42.910Z'}
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId
 * @param {*} query
 */
async function get(env, planId, query) {
  return common.get(env, '/api/xm/1/plans/', planId, query, 'Communication Plan');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-communication-plans
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 *
 * **Examples:**
 * - {embed: 'creator,constants,endpoints,forms,propertyDefinitions,integrations'}
 * - {at: '2019-01-13T20:07:42.910Z'}
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/plans', query, 'Communication Plans');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-a-communication-plan
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} plan
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} plan
 */
async function create(env, plan) {
  return common.create(env, '/api/xm/1/plans', plan, 'Communication Plan', true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-communication-plan
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plans
 * @param {*} plan object representation for the communication plan.
 */
async function update(env, plan, planId) {
  return common.update(env, '/api/xm/1/plans/', plan, planId, 'Plan');
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId
 */
async function _delete(env, planId) {
  await common.delete(env, '/api/xm/1/plans/', planId, 'Plan');
}

/**
 *
 * @param {*} destination
 * @param {*} groupMembers
 */
async function exportToImport(destination, plans) {
  return await plans.map(plan => {
    {
      return plan;
    }
  });
}

const fields = ['name', 'description', 'enabled', 'accessibleByAll', 'loggingLevel'];

/**
 *
 * @param {*} destination
 * @param {*} sourcePlans
 * @param {*} destinationPlans
 * @param {*} options
 * @param {*} groupId
 */
async function sync(destination, sourcePlans, destinationPlans, options) {
  return common.syncObject(
    'Communicatation Plan',
    sourcePlans,
    destinationPlans,
    destination,
    ['name'],
    fields,
    create,
    update,
    _delete,
    options
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
