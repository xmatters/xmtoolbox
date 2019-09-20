const util = require('./util');

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-constants
 * @param {*} env
 * @param {*} planId UUID for the communication plan to get constants from.
 * @param {*} query
 */
async function getMany(env, planId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/plans/${planId}/constants`,
    query,
    'Plan Constants'
  );
}

exports.create = create;
/**
 * https://help.xmatters.com/xmapi/index.html#create-a-plan-constant
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} constant constant object
 */
async function create(env, planId, constant) {
  return await util.create(
    env,
    `/api/xm/1/plans/${planId}/constants`,
    constant,
    `Plan Constant ${constant.name}`,
    true
  );
}

exports.update = update;
/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-plan-constant
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 * @param {*} constant constant object
 */
async function update(env, planId, constantId, constant) {
  return await util.update(
    env,
    `/api/xm/1/plans/${planId}/constants`,
    constant,
    constantId,
    'Plan Constant'
  );
}

exports.delete = _delete;
/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-plan-constant
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} constantId UUID for the constant to update
 */
async function _delete(env, planId, constantId) {
  await util.delete(
    env,
    `/api/xm/1/plans/${planId}/constants`,
    constantId,
    'Plan Constant'
  );
}
