const common = require('./common');

/**
 * A module related to xMatters integrations.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#integrations}
 *
 * @module integrations
 */

/**
 * Get a device from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-an-integration}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId The UUID of the communication plan that the integration belongs to. To get the ID of a plan, use plans.get() or plans.getMany()
 * @param {*} integrationId The name or unique identifier (id) of the integration.
 * @returns {Promise<Integration>} Integration Object Requested
 */
async function get(env, planId, integrationId) {
  return common.get(env, `/api/xm/1/plans/${planId}/integrations/`, integrationId, null, 'Integration');
}

/**
 * Get all integrations from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-integrations}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} planId The UUID of the communication plan that you want to list integrations for. Use plans.get() or plans.getMany() to get the UUID of a plan.
 * @returns {Promise<Integration[]>} Array of Integration Objects Requested
 */
async function getMany(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/integrations`, query, 'Integrations');
}

/**
 * Get all integration logs from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-integration-logs}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} integrationId The UUID of the integration that you want to retrieve the logs for. Use integrations.getMany() to get the UUID of an integration.
 * @returns {Promise<IntegrationLog[]>} Array of IntegrationLog Objects Requested
 */
async function getLogs(env, query, integrationId) {
  return common.getMany(env, `/api/xm/1/integrations/${integrationId}`, query, 'Integration Logs');
}

/**
 * Create an integration in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-an-integration}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integration {@link https://help.xmatters.com/xmapi/index.html#integration-object}
 * @param {*} planId The UUID of the communication plan that is associated with the integration.
 * @returns {Promise<Integration>} Integration Object Created
 */
async function create(env, integration, planId) {
  return common.create(env, `/api/xm/1/plans/${planId}/integrations`, integration, 'Integration', true);
}

/**
 * Update an integration in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-an-integration}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integration {@link https://help.xmatters.com/xmapi/index.html#integration-object}
 * @param {*} integrationId The unique identifier (id) of the integration you want to modify.<br><br>
 * Examples:<br>
 * - 345c95ee-4abe-47ea-ae7c-ae84fb4bee4f<br>
 * @param {*} planId The UUID of the communication plan that is associated with the integration.
 * @returns {Promise<Integration>} Integration Object Updated
 */
async function update(env, integration, integrationId, planId) {
  return common.update(
    env,
    `/api/xm/1/plans/${planId}/integrations/`,
    integration,
    integrationId,
    'Integration'
  );
}

/**
 * Delete an integration in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-an-integration}
 *
 *  @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integrationId The name or UUID of the integration.
 * @param {*} planId The UUID of the communication plan that is associated with the integration.
 * @returns {Promise}
 */
async function _delete(env, integrationId, planId) {
  await common.delete(env, `/api/xm/1/plans/${planId}/integrations/`, integrationId, 'Integration');
}

/**
 * The key values from the object that can be sychronized.
 */
const fields = [
  'name',
  'integrationType',
  'environment',
  'operation',
  'triggeredBy',
  'authenticationType',
  'createdBy',
  'deployed',
  'script',
  'endpoint',
  'integrationService'
];

exports.get = get;
exports.getMany = getMany;
exports.getLogs = getLogs;
exports.create = create;
exports.update = update;
exports.delete = _delete;
//exports.exportToImport = exportToImport;
//exports.fields = fields;
//exports.sync = sync;
