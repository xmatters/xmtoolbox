const common = require('./common');

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
  return common.getMany(env, `/api/xm/1/plans/${planId}/property-definitions`, query, 'Plan Properties');
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
  return common.create(env, `/api/xm/1/plans/${planId}/property-definitions`, property, 'Plan Property', true);
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
  return common.update(
    env,
    `/api/xm/1/plans/${planId}/property-definitions`,
    property,
    propertyId,
    'Plan Property'
  );
}

async function exportToImport(destination, planProperties, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;
  return await planProperties.map(planProperty => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      planProperty.plan = common.AssignParentObject(planProperty.plan, destinationPlans, 'name');

      return planProperty;
    }
  });
}

const fields = [
  'name',
  'propertyType',
  'description',
  'helpText',
  'default',
  'maxLength',
  'minLength',
  'pattern',
  'validate'
];

async function sync(destination, sourcePlanProperties, destinationPlanProperties, options) {
  return common.syncObject(
    'Plan Property',
    sourcePlanProperties,
    destinationPlanProperties,
    destination,
    ['name', 'plan'],
    fields,
    create,
    update,
    undefined,
    options,
    'plan'
  );
}

exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
