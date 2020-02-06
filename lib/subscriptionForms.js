const common = require('./common');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionFormId
 * @param {*} query
 */
async function get(env, subscriptionFormId, query) {
  return common.get(env, '/api/xm/1/subscription-forms/', subscriptionFormId, query, 'Subscription Form');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscription-forms', query, 'Subscription Forms');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getManyInPlan(env, query, planId) {
  return common.getMany(
    env,
    `/api/xm/1/plans/${planId}/subscription-forms`,
    query,
    'Subscription Forms In Plan'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getManyInPlan = getManyInPlan;
