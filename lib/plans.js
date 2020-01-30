const util = require('./util');

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
  return util.get(env, '/api/xm/1/plans/', planId, query, 'Communication Plan');
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
  return util.getMany(env, '/api/xm/1/plans', query, 'Communication Plans');
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
  return util.create(env, '/api/xm/1/plans', plan, 'Communication Plan', true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-communication-plan
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plans
 * @param {*} plan object representation for the communication plan.
 */
async function update(env, plan, planId) {
  return util.update(env, '/api/xm/1/plans/', plan, planId, 'Plan');
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
  await util.delete(env, '/api/xm/1/plans/', planId, 'Plan');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
