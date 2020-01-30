const util = require('./util');

/**
 * https://help.xmatters.com/xmapi/index.html#get-a-dynamic-team
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} dynamicTeamId
 * @param {*} query
 */
async function get(env, dynamicTeamId, query) {
  return util.get(env, '/api/xm/1/dynamic-teams/', dynamicTeamId, query, 'Dynamic Team');
}

/**
 * Returns Dynamic Teams from xMatters.
 *
 * https://help.xmatters.com/xmapi/index.html#get-dynamic-teams
 * @param {obj} env
 * @param {query}
 *
 * example: {embed:'supervisors,observers'}
 *
 * embed: string Example: 'supervisors,observers'
 *
 * A comma-separated list of the objects to embed in the response.
 *
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/dynamic-teams', query, 'Dynamic Teams');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} dynamicTeamId
 */
async function getMembers(env, query, dynamicTeamId) {
  return util.getMany(env, `/api/xm/1/dynamic-teams/${dynamicTeamId}/members`, query, 'Dynamic Team Members');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} dynamicTeam
 */
async function create(env, dynamicTeam) {
  return util.create(env, '/api/xm/1/dynamic-teams', dynamicTeam, 'Dynamic Team', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} dynamicTeam
 * @param {*} dynamicTeamId
 */
async function update(env, dynamicTeam, dynamicTeamId) {
  return util.update(env, '/api/xm/1/dynamic-teams/', dynamicTeam, dynamicTeamId, 'Dynamic Team');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} dynamicTeamId
 */
async function _delete(env, dynamicTeamId) {
  await util.delete(env, '/api/xm/1/dynamic-teams/', dynamicTeamId, 'Dynamic Team');
}

/**
 * Converts an array of records exported from xMatters to the format needed for import.
 * @param {*} dynamicTeams
 * @param {[obj]} destinationGroups an array of updated destination group records to find targetName matches.
 * @param {object} options
 *
 * An object with the available keys: {}
 *
 */

/**
 *
 * @param {*} destination
 * @param {*} dynamicTeams
 * @param {*} destinationData
 * @param {*} options
 */
async function exportToImport(destination, dynamicTeams, destinationData, options) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  const { defaultSupervisorId } = options;
  return dynamicTeams.map(dynamicTeam => {
    {
      delete dynamicTeam.links;

      if (dynamicTeam.criteria && dynamicTeam.criteria.criterion && dynamicTeam.criteria.criterion.data) {
        dynamicTeam.criteria.criterion = dynamicTeam.criteria.criterion.data.map(c => c);
      }

      if (dynamicTeam.observers && dynamicTeam.observers.data) {
        dynamicTeam.observers = dynamicTeam.observers.data;
        dynamicTeam.observers = dynamicTeam.observers.map(observer => {
          return { name: observer.name };
        });
      }

      //BUG IN XMAPI #152283 remove this code if empty array is allowed to unset observers
      if (dynamicTeam.observers && dynamicTeam.observers.length === 0) {
        //delete record.observers;
      }

      if (dynamicTeam.supervisors && dynamicTeam.supervisors.data) {
        dynamicTeam.supervisors = dynamicTeam.supervisors.data;
        dynamicTeam.supervisors = dynamicTeam.supervisors.map(supervisor => {
          const destinationSupervisor = destinationPeople.find(
            ({ targetName }) => targetName === supervisor.targetName
          );

          if (!destinationSupervisor) {
            destination.errors.push(
              new Error(
                `DATA INTEGRITY ISSUE: Supervisor mapping failed. Dynamic Team [${dynamicTeam.targetName}] has a supervisor with targetName [${supervisor.targetName}] but this supervisor was not found in the provided destination data.`
              )
            );
          } else {
            return destinationSupervisor.id;
          }
        });
      }

      //pull any null values from the supervisor array. will be null if matches are not found.
      if (dynamicTeam.supervisors) {
        dynamicTeam.supervisors = dynamicTeam.supervisors.filter(function(el) {
          return el != null;
        });

        //groups require at least one supervisor. If supervisors were removed then add a default.
        if (dynamicTeam.supervisors.length === 0 && defaultSupervisorId) {
          dynamicTeam.supervisors = [defaultSupervisorId];
        }
      }

      return dynamicTeam;
    }
  });
}

const fields = [
  //'id',
  'targetName',
  'recipientType',
  //'externallyOwned',
  'supervisors',
  'observers',
  'criteria'
];

/**
 * Function syncs an array of source Dynamic Teams with destination Dynamic Teams and updates the destination as necessary.
 * @param {Array[sites]} sourceDynamicTeams
 * @param {Array[sites]} destinationDynamicTeams
 * @param {xMatters Environment Object} destination
 * @param {Object} options see available options below.
 *
 * { fields, mirror, removeNow}
 *
 * fields: default: fields (an array available as an export from this module)
 *
 * This is an array of the properties to sync for a dynamic team. Set to undefined to sync all properties.
 *
 * mirror: default: false
 *
 * Set to true to perform a mirror sync. A mirror sync's goal is to remove all Dynamic Teams included in the sourceDynamicTeams from the destination not included in the destinationDynamicTeams.
 *
 * removeNow: default: false
 *
 * Use with mirror setting. Set to
 */

/**
 *
 * @param {*} destination
 * @param {*} sourceDynamicTeams
 * @param {*} destinationDynamicTeams
 * @param {*} options
 */
async function sync(destination, sourceDynamicTeams, destinationDynamicTeams, options) {
  return util.syncObject(
    'Dynamic Teams',
    sourceDynamicTeams,
    destinationDynamicTeams,
    destination,
    'targetName',
    fields,
    create,
    update,
    _delete,
    options
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getMembers = getMembers;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
