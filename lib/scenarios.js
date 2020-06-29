const common = require('./common');

/**
 * A module related to xMatters scenarios.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#scenarios}
 *
 * @module scenarios
 */

/**
 * Get a scenario from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-scenario}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} scenarioId The unique identifier (id) or name of the scenario.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Scenario>} Scenario Object Requested
 */
async function get(env, scenarioId, query) {
  return common.get(env, '/api/xm/1/scenarios/', scenarioId, query, 'Scenario');
}

/**
 * Get all scenarios from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-scenarios}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} formId The unique identifier (id) or name of the form.<br><br>
 * Examples:<br>
 * - a1341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - Executive Communications
 * @param {string} planId The unique identifier (id) or name of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - MIM
 * @returns {Promise<Scenario[]>} Array of Scenario Objects Requested
 */
async function getMany(env, query, formId, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/forms/${formId}/scenarios`, query, 'Scenarios');
}

/**
 * Create a scenario in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-scenario}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario {@link https://help.xmatters.com/xmapi/index.html#scenario-object}
 * @param {*} formId
 * @returns {Promise<Scenario>} Scenario Object Created
 */
async function create(env, scenario, formId) {
  return common.create(env, `/api/xm/1/forms/${formId}/scenarios`, scenario, 'Scenario', true);
}

/**
 * Update a scenario in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-scenario}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario {@link https://help.xmatters.com/xmapi/index.html#scenario-object}
 * @param {*} scenarioId The unique identifier (id) of the scenario to update.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {*} formId The UUID of the form you want to add the scenario for. To get the ID of a form, use forms.get() or forms.getMany() or a form in a plan using plans.get() or plans.getMany().
 * @returns {Promise<Scenario>} Scenario Object Updated
 */
async function update(env, scenario, scenarioId, formId) {
  return common.update(env, `/api/xm/1/forms/${formId}/scenarios/`, scenario, scenarioId, 'Scenario');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Scenario[]} scenarios {@link https://help.xmatters.com/xmapi/index.html#scenario-object}
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
function exportToImport(destination, scenarios, destinationData) {
  const destinationForms = (destinationData.all ? destinationData.all.forms : null) || destinationData.forms;
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return scenarios.map(scenario => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      const formName = scenario.form.name;
      scenario.form = common.AssignParentObject(scenario.form, destinationForms, 'name');

      //if the formName was returned rather than the id.
      if (formName === scenario.form) {
        destination.log.error(
          new Error(
            `DATA INTEGRITY ISSUE: Scenario [${scenario.name}] has form [${formName}] but a form with that name was not found in the provided destination data.`
          )
        );
      }

      if (scenario.permitted && scenario.permitted.data) {
        scenario.permitted = scenario.permitted.data.map(({ permissibleType, person, editor, role }) => {
          if (permissibleType === 'PERSON') {
            const destinationPerson = common.AssignParentObject(person, destinationPeople, 'targetName');

            //if the person's targetname was returned rather than the id.
            if (person.targetName === destinationPerson) {
              destination.log.error(
                new Error(
                  `DATA INTEGRITY ISSUE: Scenario [${scenario.name}] on form [${formName}] person mapping failed for permitted property. Person with targetName [${person.targetName}] was not found in the provided destination data.`
                )
              );
            }
            return { permissibleType, person: { id: destinationPerson }, editor };
          } else if (permissibleType === 'ROLE') {
            return { permissibleType, role, editor };
          }
        });
      }

      if (scenario.recipients && scenario.recipients.data) {
        scenario.recipients = scenario.recipients.data.map(({ recipientType, targetName }) => {
          return { recipientType, id: targetName };
        });
      }

      //modifed for xMatters support ticket #155953
      if (scenario.voicemailOptions && scenario.voicemailOptions.every === 0) {
        delete scenario.voicemailOptions.every;
      }

      //TODO: Remove when bug is resolved. Workaround for empty description. xMatters Support Ticket #152555
      if (scenario.description === '') scenario.description = '_';

      //added for xMatters support ticket #155953
      if (!scenario.senderOverrides) scenario.senderOverrides = {};
      if (!scenario.handling) scenario.handling = {};
      if (!scenario.overrideDeviceRestrictions) scenario.overrideDeviceRestrictions = {};

      delete scenario.position;
      delete scenario.plan;
      delete scenario.links;
      delete scenario.created;

      return scenario;
    }
  });
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  'name',
  'description',
  'priority',
  'bypassPhoneIntro',
  'escalationOverride',
  'expirationInMinutes',
  'overrideDeviceRestrictions',
  'requirePhonePassword',
  'senderOverrides',
  'voicemailOptions',
  'targetDeviceNames',
  'properties',
  'permitted',
  'recipients',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Scenario[]} sourceScenarios  An array of the scenario objects to synchronize from the source data.
 * @param {Scenario[]} destinationScenarios An array of the scenario objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceScenarios, destinationScenarios, options) {
  return common.syncObject(
    'Scenario',
    sourceScenarios,
    destinationScenarios,
    destination,
    ['name', 'form'],
    fields,
    create,
    update,
    undefined,
    options,
    'form'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
