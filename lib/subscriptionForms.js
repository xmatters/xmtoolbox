const util = require('./util');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionFormId
 * @param {*} query
 */
async function get(env, subscriptionFormId, query) {
  return util.get(env, '/api/xm/1/subscription-forms/', subscriptionFormId, query, 'Subscription Form');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/subscription-forms', query, 'Subscription Forms');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getManyInPlan(env, query, planId) {
  return util.getMany(
    env,
    `/api/xm/1/plans/${planId}/subscription-forms`,
    query,
    'Subscription Forms In Plan'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getManyInPlan = getManyInPlan;
