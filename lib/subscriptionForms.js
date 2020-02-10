const common = require('./common');

/**
 * A module related to xMatters subscription forms.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#subscription-forms}
 *
 * @module subscriptionForms
 */

/**
 * Get a subscription form from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-subscription-form}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} subscriptionFormId The unique identifier (id) of the subscription form.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {SubscriptionForm>} Subscription Form Object Requested
 */
async function get(env, subscriptionFormId, query) {
  return common.get(env, '/api/xm/1/subscription-forms/', subscriptionFormId, query, 'Subscription Form');
}

/**
 * Get all subscription forms from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscription-forms}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<SubscriptionForm[]>} Array of Subscription Form Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscription-forms', query, 'Subscription Forms');
}

/**
 * Get all subscription forms in a communication plan from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscription-forms-in-a-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - MIM
 * @returns {Promise<SubscriptionForm[]>} Array of Subscription Form Objects Requested
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
