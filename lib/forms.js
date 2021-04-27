const common = require('./common');

/**
 * A module related to xMatters forms.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#forms}
 *
 * @module forms
 */

/**
 * Get a form in a plan from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-form-in-a-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} formId The unique identifier (id) or name (targetName) of the form you want to retrieve.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name (targetName) of the plan the forms belong to.
 * @returns {Promise<Form>} The Form Objects Requested
 */
async function get(env, formId, query, planId) {
  return common.get(env, `/api/xm/1/plans/${encodeURIComponent(planId)}/forms/`, formId, query, 'Form');
}

/**
 * Get all forms from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-forms}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Form[]>} Array of Form Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/forms', query, 'Forms');
}

/**
 * Get all forms from xMatters in a plan matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-forms-in-a-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (uuid) or name (targetName) of the plan the forms belong to. Names must be URL-encoded.
 * @returns {Promise<Form[]>} Array of Form Objects Requested
 */
async function getManyInPlan(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${encodeURIComponent(planId)}/forms`, query, 'Forms In Plan');
}

/**
 * Get all response options from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-form-response-options}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} formId The unique identifier (uuid) or name (targetName) of the form you want to retrieve.
 * @param {string} planId The unique identifier (id) or name (targetName) of the plan the forms belong to.
 * @returns {Promise<ResponseOption[]>} Array of Response Option Objects Requested
 */
async function getResponseOptions(env, query, formId, planId) {
  return common.getMany(
    env,
    `/api/xm/1/plans/${planId}/forms/${encodeURIComponent(formId)}/response-options`,
    query,
    'Form Response Options'
  );
}

/**
 * Get all sections in a form from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-form-sections}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} formId The unique identifier (id) or name (targetName) of the form you want to retrieve.
 * @returns {Promise<FormSection[]>} Array of Form Section Objects Requested
 */
async function getFormSections(env, query, formId) {
  return common.getMany(
    env,
    `/api/xm/1/forms/${encodeURIComponent(formId)}/sections`,
    query,
    'Sections of Form',
    false
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getManyInPlan = getManyInPlan;
exports.getResponseOptions = getResponseOptions;
exports.getFormSections = getFormSections;
