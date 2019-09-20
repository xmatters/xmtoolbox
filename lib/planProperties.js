const util = require('./util');

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-plan-properties
 * @param {*} env
 * @param {*} planId UUID for the communication plan to get properties from.
 * @param {*} query
 */
async function getMany(env, planId, query) {
  return await util.getMany(
    env,
    `/api/xm/1/plans/${planId}/property-definitions`,
    query,
    'Plan Propertys'
  );
}

exports.create = create;
/**
 * https://help.xmatters.com/xmapi/index.html#create-plan-properties
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} property property object
 */
async function create(env, planId, property) {
  return await util.create(
    env,
    `/api/xm/1/plans/${planId}/property-definitions`,
    property,
    `Plan Property ${property.name}`,
    true
  );
}

exports.update = update;
/**
 * https://help.xmatters.com/xmapi/index.html#modify-plan-properties
 * @param {*} env
 * @param {*} planId UUID for the communication plan
 * @param {*} propertyId UUID for the property to update
 * @param {*} property property object
 */
async function update(env, planId, propertyId, property) {
  return await util.update(
    env,
    `/api/xm/1/plans/${planId}/property-definitions`,
    property,
    propertyId,
    'Plan Property'
  );
}
