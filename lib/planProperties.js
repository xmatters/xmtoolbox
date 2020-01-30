const util = require('./util');

/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-properties
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan to get properties from.
 * @param {*} query
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} planId
 */
async function getMany(env, query, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/property-definitions`, query, 'Plan Properties');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-plan-properties
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} property property object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} property
 * @param {*} planId
 */
async function create(env, property, planId) {
  return util.create(env, `/api/xm/1/plans/${planId}/property-definitions`, property, 'Plan Property', true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-plan-properties
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} planId UUID for the communication plan
 * @param {*} propertyId UUID for the property to update
 * @param {*} property property object
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} property
 * @param {*} propertyId
 * @param {*} planId
 */
async function update(env, property, propertyId, planId) {
  return util.update(
    env,
    `/api/xm/1/plans/${planId}/property-definitions`,
    property,
    propertyId,
    'Plan Property'
  );
}

exports.getMany = getMany;
exports.create = create;
exports.update = update;
