const util = require('./util');

exports.get = get;
/**
 * https://help.xmatters.com/xmapi/index.html#get-an-integration
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} integrationId  UUID for the integration
 */
async function get(env, planId, integrationId) {
  return util.get(
    env,
    `/api/xm/1/plans/${planId}/integrations/`,
    integrationId,
    null,
    `Integration ${planId} ${integrationId}`
  );
}

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-integrations
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} query
 *
 * **Examples**
 * - {embed: 'logs'}
 * - {integrationType: 'INBOUND_WEBHOOK', deployed: 'true', embed: 'logs'}
 */
async function getMany(env, planId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/plans/${planId}/integrations`,
    query,
    `Integrations for ${planId}`
  );
}

exports.getManyLogs = getManyLogs;
/**
 * https://help.xmatters.com/xmapi/index.html#get-integration-logs
 * @param {*} env
 * @param {string} integrationId UUID for the integration
 */
async function getManyLogs(env, integrationId) {
  return await util.getMany(
    env,
    `/api/xm/1/integrations/${integrationId}`,
    null,
    `Integration Logs for : ${integrationId}`
  );
}

exports.create = create;
/**
 * https://help.xmatters.com/xmapi/index.html#create-an-integration
 * @param {*} env
 * @param {string} planId UUID for the communication plan to add the integration to.
 * @param {*} integration
 */
async function create(env, planId, integration) {
  return await util.create(
    env,
    `/api/xm/1/plans/${planId}/integrations`,
    integration,
    `Integration for plans ${planId}`,
    true
  );
}

exports.update = update;
/**
 * https://help.xmatters.com/xmapi/index.html#modify-an-integration
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} integrationId UUID for the integrationID
 * @param {*} integration object representation of the integration to update
 */
async function update(env, planId, integrationId, integration) {
  return await util.update(
    env,
    `/api/xm/1/plans/${planId}/integrations/`,
    integration,
    integrationId,
    'Integration'
  );
}

exports.delete = _delete;
/**
 * https://help.xmatters.com/xmapi/index.html#delete-an-integration
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} integrationId UUID for the integrationID
 */
async function _delete(env, planId, integrationId) {
  await util.delete(
    env,
    `/api/xm/1/plans/${planId}/integrations/`,
    integrationId,
    'Integration'
  );
}
