const util = require('./util');

exports.get = get;
/**
 * https://help.xmatters.com/xmapi/index.html#get-a-communication-plan
 * @param {*} env
 * @param {*} id UUID for the communication plan
 * @param {*} query
 *
 * **Examples:**
 * - {embed: 'creator,constants,endpoints,forms,propertyDefinitions,integrations'}
 * - {at: '2019-01-13T20:07:42.910Z'}
 */
async function get(env, id, query) {
  return util.get(env, '/api/xm/1/plans/', id, query, 'Communication Plan');
}

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-communication-plans
 * @param {*} env
 * @param {*} query
 *
 * **Examples:**
 * - {embed: 'creator,constants,endpoints,forms,propertyDefinitions,integrations'}
 * - {at: '2019-01-13T20:07:42.910Z'}
 */
async function getMany(env, query) {
  return await util.getMany(
    env,
    '/api/xm/1/plans',
    query,
    'Communication Plans'
  );
}

exports.create = create;
/**
 * https://help.xmatters.com/xmapi/index.html#create-a-communication-plan
 * @param {*} env
 * @param {*} plan
 */
async function create(env, plan) {
  return await util.create(
    env,
    '/api/xm/1/plans',
    plan,
    `Communication Plan ${plan.name}`,
    true
  );
}

exports.update = update;
/**
 * https://help.xmatters.com/xmapi/index.html#modify-communication-plan
 * @param {*} env
 * @param {*} planId UUID for the communication plans
 * @param {*} plan object representation for the communication plan.
 */
async function update(env, planId, plan) {
  return await util.update(env, '/api/xm/1/plans/', plan, planId, 'Plan');
}

exports.delete = _delete;
/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 */
async function _delete(env, planId) {
  await util.delete(env, '/api/xm/1/plans/', id, 'Plan');
}
