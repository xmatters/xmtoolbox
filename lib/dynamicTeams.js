const common = require('./common');

/**
 * A module related to xMatters dynamic teams.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#dynamic-teams}
 *
 * @module dynamicTeams
 */

/**
 * Get a dynamic team from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-dynamic-team}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} dynamicTeamId The unique id of the dynamic team.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<DynamicTeam>} Dynamic Team Object Requested
 */
async function get(env, dynamicTeamId, query) {
  return common.get(env, '/api/xm/1/dynamic-teams/', dynamicTeamId, query, 'Dynamic Team');
}

/**
 * Get all dynamic teams from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-dynamic-teams}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<DynamicTeam[]>} Array of Dynamic Team Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/dynamic-teams', query, 'Dynamic Teams');
}

/**
 * Get all dynamic teams members from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-dynamic-team-members}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} dynamicTeamId The unique id or targetNameof the dynamic team.
 * @returns {Promise<module:people.Person[]>} Array of Person Objects from the Dynamic Team Requested
 */
async function getMembers(env, query, dynamicTeamId) {
  return common.getMany(
    env,
    `/api/xm/1/dynamic-teams/${dynamicTeamId}/members`,
    query,
    'Dynamic Team Members'
  );
}

/**
 * Create a dynamic team in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-dynamic-team}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {DynamicTeam} dynamicTeam
 * @returns {Promise<DynamicTeam>} Dynamic Team Object Created
 */
async function create(env, dynamicTeam) {
  return common.create(env, '/api/xm/1/dynamic-teams', dynamicTeam, 'Dynamic Team', true);
}

/**
 * Update a dynamic team in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#update-a-dynamic-team}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {DynamicTeam} dynamicTeam
 * @param {string} dynamicTeamId The unique identifier (id) of the dynamic team you want to modify.
 * @returns {Promise<DynamicTeam>} Dynamic Team Object Updated
 */
async function update(env, dynamicTeam, dynamicTeamId) {
  return common.update(env, '/api/xm/1/dynamic-teams/', dynamicTeam, dynamicTeamId, 'Dynamic Team');
}

/**
 * Delete a dynamic team in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-dynamic-team}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} dynamicTeamId The unique identifier (id) or name (targetName) of the dynamic team.<br><br>
 * Examples:<br>
 * - MIMTeam1<br>
 * - a6341d69-5683-4621-b8c8-f2e728f6752q
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, dynamicTeamId) {
  await common.delete(env, '/api/xm/1/dynamic-teams/', dynamicTeamId, 'Dynamic Team');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {DynamicTeam[]} dynamicTeams Array of Dynamic Teams to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @param {Object} options
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
            destination.log.error(
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
        dynamicTeam.supervisors = dynamicTeam.supervisors.filter(function (el) {
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

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  //'id',
  'targetName',
  'recipientType',
  //'externallyOwned',
  'supervisors',
  'observers',
  'criteria',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {DynamicTeam[]} sourceDynamicTeams  An array of the dynamic team objects to synchronize from the source data.
 * @param {DynamicTeam[]} destination An array of the dynamic team objects to synchronize from the destination data.
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
async function sync(destination, sourceDynamicTeams, destinationDynamicTeams, options) {
  return common.syncObject(
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
