const util = require('./util');

/**
 * https://help.xmatters.com/xmapi/index.html#get-an-import-job
 * @param {*} env
 * @param {*} importId
 * @param {*} query
 *
 * **Examples:**
 * none, no documented options. kept for future use
 */
async function get(env, importId, query) {
  return util.get(env, '/api/xm/1/imports/', importId, query, 'Import Job');
}

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
  return util.getMany(env, '/api/xm/1/imports', query, 'Import Jobs');
}

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
async function getMessages(env, query, importId) {
  return await util.getMany(
    env,
    `/api/xm/1/imports/${importId}/import-messages`,
    query,
    'Import Job Messages'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getMessages = getMessages;
