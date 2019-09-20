const util = require('./util');

exports.get = get;
/**
 *https://help.xmatters.com/xmapi/index.html#get-a-form-in-a-plan
 * @param {*} env
 * @param {*} planId communication plan UUID
 * @param {string} formId form UUID
 */
async function get(env, planId, formId) {
  return util.get(
    env,
    `/api/xm/1/plans/${planId}/forms/`,
    formId,
    query,
    `Annotation ${formId}`
  );
}

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-forms
 * @param {*} env
 * @param {*} query
 *
 * **Examples:**
 * - {search:'IT',fields: 'DESCRIPTION'}
 * - {embed: 'recipients,scenarios'}
 * - {sortBy: 'NAME', sortOrder: 'ASCENDING'}
 */
async function getMany(env, query) {
  return await util.getMany(env, '/api/xm/1/forms', query);
}

exports.getManyInPlan = getManyInPlan;
/**
 * https://help.xmatters.com/xmapi/index.html#get-forms-in-a-plan
 * @param {*} env
 * @param {string} planId Communication Plan UUID
 * @param {*} query
 *
 * **Examples:**
 * - {embed: 'responseOptions,recipients,scenarios'}
 * - {sortBy: 'NAME,USER_DEFINED', sortOrder: 'ASCENDING'}
 */
async function getManyInPlan(env, planId, query) {
  return await util.getMany(env, `/api/xm/1/plans/${planId}/forms`, query);
}

exports.getManyResponseOptions = getManyResponseOptions;
/**
 * https://help.xmatters.com/xmapi/index.html#get-form-response-options
 * @param {*} env
 * @param {string} planId Communication Plan UUID
 * @param {string} formId Form UUID
 * @param {*} query
 */
async function getManyResponseOptions(env, planId, formId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/plans/${planId}/forms/${formId}/response-options`,
    query,
    'Response Options'
  );
}
