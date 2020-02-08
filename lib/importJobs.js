const common = require('./common');

/**
 * A module related to xMatters import jobs.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#import-jobs}
 *
 * @module importJobs
 */

/**
 * Get a import job from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-an-import-job}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} importId
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<ImportJob>} Import Job Object Requested
 */
async function get(env, importId, query) {
  return common.get(env, '/api/xm/1/imports/', importId, query, 'Import Job');
}

/**
 * Get all import jobs from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-import-jobs}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<ImportJob[]>} Array of Import Job Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/imports', query, 'Import Jobs');
}

/**
 * Get all Import Job Messages from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-import-job-messages}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} importId
 * @returns {Promise<ImportMessage[]>} Array of Import Message Objects Requested
 */
async function getMessages(env, query, importId) {
  return await common.getMany(
    env,
    `/api/xm/1/imports/${importId}/import-messages`,
    query,
    'Import Job Messages'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getMessages = getMessages;
