const util = require('./util');

async function get(env, constantId, query, planId) {
  return util.get(env, `/api/xm/1/plans/${planId}/constants/`, constantId, query, 'Plan Constant');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-constants
 * @param {*} env
 * @param {*} planId UUID for the communication plan to get constants from.
 * @param {*} query
 */
async function getMany(env, query, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/constants`, query, 'Plan Constants');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-a-plan-constant
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} constant constant object
 */
async function create(env, constant, planId) {
  return util.create(env, `/api/xm/1/plans/${planId}/constants`, constant, `Plan Constant`, true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-plan-constant
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 * @param {*} constant constant object
 */
async function update(env, constant, constantId, planId) {
  return util.update(
    env,
    `/api/xm/1/plans/${planId}/constants`,
    constant,
    constantId,
    'Plan Constant'
  );
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan-constant
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 */
async function _delete(env, constantId, planId) {
  await util.delete(env, `/api/xm/1/plans/${planId}/constants`, constantId, 'Plan Constant');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
