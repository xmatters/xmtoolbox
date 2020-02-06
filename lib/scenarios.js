const common = require('./common');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenarioId
 * @param {*} query
 */
async function get(env, scenarioId, query) {
  return common.get(env, '/api/xm/1/scenarios/', scenarioId, query, 'Scenario');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} formId
 * @param {*} planId
 */
async function getMany(env, query, formId, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/forms/${formId}/scenarios`, query, 'Scenarios');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario
 * @param {*} formId
 */
async function create(env, scenario, formId) {
  return common.create(env, `/api/xm/1/forms/${formId}/scenarios`, scenario, 'Scenario', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario
 * @param {*} scenarioId
 * @param {*} formId
 */
async function update(env, scenario, scenarioId, formId) {
  return common.update(env, `/api/xm/1/forms/${formId}/scenarios/`, scenario, scenarioId, 'Scenario');
}

async function exportToImport(destination, scenarios, destinationData) {
  const destinationForms = (destinationData.all ? destinationData.all.forms : null) || destinationData.forms;
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return await scenarios.map(scenario => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      scenario.form = common.AssignParentObject(scenario.form, destinationForms, 'name');

      if (scenario.permitted && scenario.permitted.data) {
        scenario.permitted = scenario.permitted.data.map(({ permissibleType, person, editor, role }) => {
          if (permissibleType === 'PERSON') {
            const destinationPerson = common.AssignParentObject(person, destinationPeople, 'targetName');
            return { permissibleType, person: destinationPerson, editor };
          } else if (permissibleType === 'ROLE') {
            return { permissibleType, role, editor };
          }
        });
      }

      if (scenario.voicemailOptions.every === 0) {
        delete scenario.voicemailOptions.every;
      }

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
