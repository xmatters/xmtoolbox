const util = require('./util');

/**
 * https://help.xmatters.com/xmapi/index.html#get-an-integration
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} integrationId  UUID for the integration
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId
 * @param {*} integrationId
 */
async function get(env, planId, integrationId) {
  return util.get(env, `/api/xm/1/plans/${planId}/integrations/`, integrationId, null, 'Integration');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-integrations
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} query
 *
 * **Examples**
 * - {embed: 'logs'}
 * - {integrationType: 'INBOUND_WEBHOOK', deployed: 'true', embed: 'logs'}
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getMany(env, query, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/integrations`, query, 'Integrations');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-integration-logs
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {string} integrationId UUID for the integration
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} integrationId
 */
async function getLogs(env, query, integrationId) {
  return util.getMany(env, `/api/xm/1/integrations/${integrationId}`, query, 'Integration Logs');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-an-integration
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {string} planId UUID for the communication plan to add the integration to.
 * @param {*} integration
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integration
 * @param {*} planId
 */
async function create(env, integration, planId) {
  return util.create(env, `/api/xm/1/plans/${planId}/integrations`, integration, 'Integration', true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-an-integration
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} integrationId UUID for the integrationID
 * @param {*} integration object representation of the integration to update
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integration
 * @param {*} integrationId
 * @param {*} planId
 */
async function update(env, integration, integrationId, planId) {
  return util.update(
    env,
    `/api/xm/1/plans/${planId}/integrations/`,
    integration,
    integrationId,
    'Integration'
  );
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-an-integration
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} integrationId UUID for the integrationID
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integrationId
 * @param {*} planId
 */
async function _delete(env, integrationId, planId) {
  await util.delete(env, `/api/xm/1/plans/${planId}/integrations/`, integrationId, 'Integration');
}

exports.get = get;
exports.getMany = getMany;
exports.getLogs = getLogs;
exports.create = create;
exports.update = update;
exports.delete = _delete;
