const common = require('./common');

/**
 * A module related to xMatters communication plans.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#plans}
 *
 * @module plans
 */

/**
 * Get a plan from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-communication-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} planId The unique identifier (id) or name of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - MIM
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Plan>} Plan Object Requested
 */
async function get(env, planId, query) {
  return common.get(env, '/api/xm/1/plans/', planId, query, 'Communication Plan');
}

/**
 * Get all plans from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-communication-plans}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Plan[]>} Array of Plan Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/plans', query, 'Communication Plans');
}

/**
 * Create a communication plan in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-communication-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Plan} plan {@link https://help.xmatters.com/xmapi/index.html#plan-object}
 * @returns {Promise<Plan>} Plan Object Created
 */
async function create(env, plan) {
  return common.create(env, '/api/xm/1/plans', plan, 'Communication Plan', true);
}

/**
 * Update a plan in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-communication-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Plan} plan {@link https://help.xmatters.com/xmapi/index.html#plan-object}
 * @param {string} planId The unique identifier (id) of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Plan>} Plan Object Updated
 */
async function update(env, plan, planId) {
  return common.update(env, '/api/xm/1/plans/', plan, planId, 'Plan');
}

/**
 * Delete a communication plan in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} planId The unique identifier (id) or name of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - MIM
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, planId) {
  await common.delete(env, '/api/xm/1/plans/', planId, 'Plan');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Plan[]} plans Array of plan objects to transform.
 * @returns {Promise}
 */
async function exportToImport(destination, plans) {
  return common.convertDefaultInitial(await plans, convert);

  function convert(plan) {
    {
      return plan;
    }
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = ['name', 'description', 'enabled', 'accessibleByAll', 'loggingLevel'];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Plan[]} sourcePlans An array of the communication plan objects to synchronize from the source data.
 * @param {Plan[]} destination The xmtoolbox representation of the target or destination xMatters instance.Plans
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
async function sync(destination, sourcePlans, destinationPlans, options) {
  return common.syncObject(
    'Communication Plan',
    sourcePlans,
    destinationPlans,
    destination,
    ['name'],
    fields,
    create,
    update,
    _delete,
    options
  );
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
