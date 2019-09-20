const util = require('./util');

exports.get = get;
/**
 * https://help.xmatters.com/xmapi/index.html#get-an-import-job
 * @param {*} env
 * @param {*} id
 * @param {*} query
 *
 * **Examples:**
 * none, no documented options. kept for future use
 */
async function get(env, id, query) {
  return util.get(env, '/api/xm/1/imports/', id, query);
}

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-import-jobs
 * @param {*} env
 * @param {*} query
 *
 * **Examples**
 * - {transformType: "users-v1"}
 * - {sortBy: "NAME"}
 * - {sortOrder: "ASCENDING"}
 */
async function getMany(env, query) {
  return await util.getMany(env, '/api/xm/1/imports', query);
}

exports.create = create;
async function create(env, group) {
  return await util.create(
    env,
    '/api/xm/1/imports',
    group,
    `Import ${group.targetName}`,
    true
  );
}

exports.getManyMessages = getManyMessages;
/**
 * https://help.xmatters.com/xmapi/index.html#get-import-job-messages
 *
 * @param {*} env
 * @param {string} importId UUID for the import
 * @param {*} query
 *
 * **Examples**
 * - {sortBy: "NAME"}
 * - {sortOrder: "ASCENDING"}
 */
async function getManyMessages(env, importId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/imports/${importId}/import-messages`,
    query
  );
}
