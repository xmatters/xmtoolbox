const common = require('./common');

/**
 * A module related to xMatters subscription forms.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#subscription-forms}
 *
 * @module subscriptionForms
 */

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionFormId
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function get(env, subscriptionFormId, query) {
  return common.get(env, '/api/xm/1/subscription-forms/', subscriptionFormId, query, 'Subscription Form');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscription-forms', query, 'Subscription Forms');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
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
