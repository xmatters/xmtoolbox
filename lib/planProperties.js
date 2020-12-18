const common = require('./common');

/**
 * A module related to xMatters communication plan properties.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#plan-properties}
 *
 * @module planProperties
 */

/**
 * Get all plan properties in a communication plan from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-plan-properties}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the plan that you want to retrieve the properties for. Use plans.get() or plans.getMany() to find the id or name of the plan.
 * @returns {Promise<PlanProperty[]>} Array of Plan Property Objects Requested
 */
async function getMany(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/property-definitions`, query, 'Plan Properties');
}

/**
 * Create a plan property in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-plan-properties}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {PlanProperty} property {@link https://help.xmatters.com/xmapi/index.html#property-object}
 * @param {string} planId The unique identifier (id) or name of the plan that will contain the property.
 * @returns {Promise<PlanProperty>} Plan Property Object Created
 */
async function create(env, property, planId) {
  return common.create(
    env,
    `/api/xm/1/plans/${planId}/property-definitions`,
    property,
    'Plan Property',
    true
  );
}

/**
 * Update a plan property in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-plan-properties}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {PlanProperty} property {@link https://help.xmatters.com/xmapi/index.html#property-object}
 * @param {string} propertyId
 * @param {string} planId The unique identifier (id) or name of the plan containing the property.
 * @returns {Promise<PlanProperty>} Plan Property Object Updated
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

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {PlanProperty[]} planProperties Array of plan property objects to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, planProperties, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;
  return convertDefaultInitial(await planProperties, convert);

  function convert(planProperty) {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      planProperty.plan = common.AssignParentObject(planProperty.plan, destinationPlans, 'name');

      return planProperty;
    }
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  'name',
  'propertyType',
  'description',
  'helpText',
  'default',
  'maxLength',
  'minLength',
  'pattern',
  'validate',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {PlanProperty[]} sourcePlanProperties An array of the plan property objects to synchronize from the source data.
 * @param {PlanProperty[]} destinationPlanProperties An array of the plan property objects to synchronize from the source data.
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
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
