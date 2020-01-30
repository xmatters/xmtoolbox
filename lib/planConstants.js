const util = require('./util');

async function get(env, constantId, query, planId) {
  return util.get(env, `/api/xm/1/plans/${planId}/constants/`, constantId, query, 'Plan Constant');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-constants
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan to get constants from.
 * @param {*} query
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getMany(env, query, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/constants`, query, 'Plan Constants');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-a-plan-constant
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} constant constant object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} constant
 * @param {*} planId
 */
async function create(env, constant, planId) {
  return util.create(env, `/api/xm/1/plans/${planId}/constants`, constant, `Plan Constant`, true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-plan-constant
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 * @param {*} constant constant object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} constant
 * @param {*} constantId
 * @param {*} planId
 */
async function update(env, constant, constantId, planId) {
  return util.update(env, `/api/xm/1/plans/${planId}/constants`, constant, constantId, 'Plan Constant');
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan-constant
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} constantId
 * @param {*} planId
 */
async function _delete(env, constantId, planId) {
  await util.delete(env, `/api/xm/1/plans/${planId}/constants`, constantId, 'Plan Constant');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
