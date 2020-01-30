const util = require('./util');

/**
 *https://help.xmatters.com/xmapi/index.html#get-a-form-in-a-plan
 * @param {*} env
 * @param {string} formId form UUID
 * @param {*} planId communication plan UUID
 */
async function get(env, formId, query, planId) {
  return util.get(env, `/api/xm/1/plans/${planId}/forms/`, formId, query, 'Form');
}

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
  return util.getMany(env, '/api/xm/1/forms', query, 'Forms');
}

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
async function getManyInPlan(env, query, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/forms`, query, 'Forms In Plan');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-form-response-options
 * @param {*} env
 * @param {string} formId Form UUID
 * @param {string} planId Communication Plan UUID
 * @param {*} query
 */
async function getResponseOptions(env, query, formId, planId) {
  return util.getMany(
    env,
    `/api/xm/1/plans/${planId}/forms/${formId}/response-options`,
    query,
    'Form Response Options'
  );
}

async function getFormSections(env, query, formId) {
  return util.getMany(env, `/api/xm/1/forms/${formId}/sections`, query, 'Sections of Form');
}

exports.get = get;
exports.getMany = getMany;
exports.getManyInPlan = getManyInPlan;
exports.getResponseOptions = getResponseOptions;
exports.getFormSections = getFormSections;
