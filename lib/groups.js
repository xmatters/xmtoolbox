const common = require('./common');
const shifts = require('./shifts');

/**
 * A module related to xMatters groups.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#groups}
 *
 * @module groups
 */

/**
 * Get a group from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-group}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} groupId The unique identifier (id) or name (targetName) of the group. <br><br>
 * Examples:<br>
 * - Oracle Administrators<br>
 * - 438e9245-b32d-445f-916bd3e07932c892
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Group>} Group Object Requested
 */
async function get(env, groupId, query, throwError) {
  return common.get(env, '/api/xm/1/groups/', groupId, query, 'Group', throwError);
}

/**
 * Get all groups from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-groups}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Group[]>} Array of Group Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/groups', query, 'Groups');
}

/**
 * Get all group supervisors from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-group-39-s-supervisors}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group
 * @returns {Promise<Person[]>} Array of Person Objects Requested
 */
async function getSupervisors(env, query, groupId) {
  return common.getMany(env, `/api/xm/1/groups/${groupId}/supervisors`, query, 'Group Supervisors');
}

/**
 * Create a group in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-group}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Group} group {@link https://help.xmatters.com/xmapi/index.html#group-object}
 * @returns {Promise<Group>} Group Object Created
 */
async function create(env, group) {
  return common.create(env, '/api/xm/1/groups', group, 'Group', true);
}

/**
 * Update a group in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-group}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Group} group {@link https://help.xmatters.com/xmapi/index.html#group-object}
 * @param {string} groupId The unique identifier (id) of the group. <br><br>
 * Examples:<br>
 * - 438e9245-b32d-445f-916bd3e07932c892
 * @returns {Promise<Group>} Group Object Updated
 */
async function update(env, group, groupId) {
  return common.update(env, '/api/xm/1/groups/', group, groupId, 'Group');
}

/**
 * Delete a group in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-group}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group. <br><br>
 * Examples:<br>
 * - Oracle Administrators<br>
 * - 438e9245-b32d-445f-916bd3e07932c892
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, groupId) {
  await common.delete(env, '/api/xm/1/groups/', groupId, 'Group');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Group[]} groups Array of groups to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @param {Object} options
 * @returns {Promise}
 */
async function exportToImport(destination, groups, destinationData, options) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  const destinationSites = (destinationData.all ? destinationData.all.sites : null) || destinationData.sites;
  const { defaultSupervisorId } = options;

  return groups.map(group => {
    {
      delete group.links;

      if (group.site && group.site.name) {
        group.site = destinationSites.find(({ name }) => group.site.name === name).id;
      }

      if (group.observers && group.observers.data) {
        group.observers = group.observers.data;

        group.observers = group.observers.map(observer => observer.name);
      }
      if (group.supervisors) {
        if (group.supervisors.data) group.supervisors = group.supervisors.data;

        group.supervisors = group.supervisors.map(supervisor => {
          const destinationSupervisor = destinationPeople.find(
            ({ targetName }) => targetName === (supervisor.targetName || supervisor)
          );

          if (!destinationSupervisor) {
            destination.log.warn(
              `DATA INTEGRITY ISSUE: Supervisor mapping failed. Group [${group.targetName}] has a supervisor with targetName [${supervisor.targetName}] but this supervisor was not found in the provided destination data.`
            );
          } else {
            return destinationSupervisor.id;
          }
        });
      }

      //pull any null values from the supervisor array. will be null if matches are not found.
      if (group.supervisors) {
        group.supervisors = group.supervisors.filter(function (el) {
          return el != null;
        });

        //groups require at least one supervisor. If supervisors were removed then add a default.
        if (group.supervisors.length === 0 && defaultSupervisorId) {
          group.supervisors = [defaultSupervisorId];
        }
      }

      return group;
    }
  });
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  'allowDuplicates',
  //'externallyOwned',
  'description',
  //'id',
  'externalKey',
  'observedByAll',
  'observers',
  'recipientType',
  'site',
  'status',
  'supervisors',
  'targetName',
  'useDefaultDevices',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param [Group[]]} sourceGroups An array of the group objects to synchronize from the source data.
 * @param {Group[]} destinationGroups An array of the group objects to synchronize from the destination data.
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
async function sync(destination, sourceGroups, destinationGroups, options) {
  const syncResults = await common.syncObject(
    'Group',
    sourceGroups,
    destinationGroups,
    destination,
    'targetName',
    fields,
    create,
    update,
    _delete,
    options
  );

  if (options.deleteShiftsOnCreate && syncResults.created) {
    //remove all default shifts...
    await Promise.all(syncResults.created.map(g => shifts.delete(destination, 'Default Shift', g.id)));
  }

  return syncResults;
}

exports.get = get;
exports.getMany = getMany;
exports.getSupervisors = getSupervisors;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
