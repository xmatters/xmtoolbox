const common = require('./common');

/**
 * A module related to xMatters scenarios.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#scenarios}
 *
 * @module scenarios
 */

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenarioId
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function get(env, scenarioId, query) {
  return common.get(env, '/api/xm/1/scenarios/', scenarioId, query, 'Scenario');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} formId
 * @param {*} planId
 */
async function getMany(env, query, formId, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/forms/${formId}/scenarios`, query, 'Scenarios');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario
 * @param {*} formId
 */
async function create(env, scenario, formId) {
  return common.create(env, `/api/xm/1/forms/${formId}/scenarios`, scenario, 'Scenario', true);
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario
 * @param {*} scenarioId
 * @param {*} formId
 */
async function update(env, scenario, scenarioId, formId) {
  return common.update(env, `/api/xm/1/forms/${formId}/scenarios/`, scenario, scenarioId, 'Scenario');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} scenarios
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 */
async function exportToImport(destination, scenarios, destinationData) {
  const destinationForms = (destinationData.all ? destinationData.all.forms : null) || destinationData.forms;
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return await scenarios.map(scenario => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      const formName = scenario.form.name;
      scenario.form = common.AssignParentObject(scenario.form, destinationForms, 'name');

      //if the formName was returned rather than the id.
      if (formName === scenario.form) {
        destination.errors.push(
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
              destination.errors.push(
                new Error(
                  `DATA INTEGRITY ISSUE: Scenario [${scenario.name}] on form [${scenario.form.name}] person mapping failed for permitted property. Person with targetName [${person.targetName}] was not found in the provided destination data.`
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

      if (scenario.voicemailOptions.every === 0) {
        delete scenario.voicemailOptions.every;
      }

      //TODO: Remove when bug is resolved. Workound for empty description. xMatters Support Ticket #152555
      if (scenario.description === '') scenario.description = '_';

      delete scenario.position;
      delete scenario.plan;
      delete scenario.links;
      delete scenario.created;

      return scenario;
    }
  });
}

const fields = [
  'name',
  'description',
  'priority',
  'bypassPhoneIntro',
  'escalationOverride',
  'expirationInMinutes',
  'overrideDeviceRestrictions'
];

/**
 *
 * @param {Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.} destination
 * @param {*} sourceScenarios
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.Scenarios
 * @param {*} options
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
