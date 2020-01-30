const util = require('./util');

/**
 * Returns a Group object that contains a representation of the group.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-group
 * @param {*} env
 * @param {string} id The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {string} query A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 * Example: 2017-05-01T19:00:00.000Z
 */
async function get(env, groupId, query) {
  return util.get(env, '/api/xm/1/groups/', groupId, query, 'Group');
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-groups
 * @param {*} env
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/groups', query, 'Groups');
}

async function getSupervisors(env, query, groupId) {
  return util.getMany(env, `/api/xm/1/groups/${groupId}/supervisors`, query, 'Group Supervisors');
}

/**
 * https://help.xmatters.com/xmapi/index.html#create-a-group
 * @param {*} env
 * @param {*} group
 */
async function create(env, group) {
  return util.create(env, '/api/xm/1/groups', group, 'Group', true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-group
 * @param {*} env
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {*} group
 */
async function update(env, group, groupId) {
  return util.update(env, '/api/xm/1/groups/', group, groupId, 'Group');
}

/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-group
 * @param {*} env
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 */
async function _delete(env, groupId) {
  await util.delete(env, '/api/xm/1/groups/', groupId, 'Group');
}

/**
 * Converts an array of records exported from xMatters to the format needed for import.
 * @param {*} groups
 * @param {[obj]} destinationGroups an array of updated destination group records to find targetName matches.
 * @param {object} options
 *
 * An object with the available keys: {}
 *
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
      if (group.supervisors && group.supervisors.data) {
        group.supervisors = group.supervisors.data;
        group.supervisors = group.supervisors.map(supervisor => {
          const destinationSupervisor = destinationPeople.find(
            ({ targetName }) => targetName === supervisor.targetName
          );

          if (!destinationSupervisor) {
            destination.errors.push(
              new Error(
                `DATA INTEGRITY ISSUE: Supervisor mapping failed. Group [${group.targetName}] has a supervisor with targetName [${supervisor.targetName}] but this supervisor was not found in the provided destination data.`
              )
            );
          } else {
            return destinationSupervisor.id;
          }
        });
      }

      //pull any null values from the supervisor array. will be null if matches are not found.
      if (group.supervisors) {
        group.supervisors = group.supervisors.filter(function(el) {
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
  'useDefaultDevices'
];

/**
 * Function syncs an array of source groups with destination groups and updates the destination as necessary.
 * @param {Array[sites]} sourceGroups
 * @param {Array[sites]} destinationGroups
 * @param {xMatters Environment Object} destination
 * @param {Object} options see available options below.
 *
 * { fields, mirror, removeNow}
 *
 * fields: default: fields (an array available as an export from this module)
 *
 * This is an array of the properties to sync for a user. Set to undefined to sync all properties.
 *
 * mirror: default: false
 *
 * Set to true to perform a mirror sync. A mirror sync's goal is to remove all groups included in the sourceGroups from the destination not included in the destinationGroups.
 *
 * removeNow: default: false
 *
 * Use with mirror setting. Set to
 */
async function sync(destination, sourceGroups, destinationGroups, options) {
  return util.syncObject(
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
