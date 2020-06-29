const common = require('./common');

/**
 * A module related to xMatters people.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#people}
 *
 * @module people
 */

/**
 * Get a person from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-person-by-id}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} personId The unique identifier (id) or name (targetName) of the person.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - mmcbride
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Person>} Person Object Requested
 */
async function get(env, personId, query, throwError) {
  return common.get(env, '/api/xm/1/people/', personId, query, 'Person', throwError);
}

/**
 * Get all people from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-people}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Person[]>} Array of Person Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/people', query, 'People');
}

/**
 * Get all supervisors for a person from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-person-39-s-supervisors}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} personId The unique identifier (id) or name (targetName) of the person.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - mmcbride
 * @returns {Promise<Person[]>} Array of Person Objects Requested
 */
async function getSupervisors(env, query, personId) {
  return common.getMany(env, `/api/xm/1/people/${personId}/supervisors`, query, 'Person Supervisors');
}

/**
 * Get all devices for a person from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-person-39-s-devices}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} personId The unique identifier (id) or name (targetName) of the person.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - mmcbride
 * @returns {Promise<Device[]>} Array of Device Objects Requested
 */
async function getDevices(env, query, personId) {
  return common.getMany(env, `/api/xm/1/people/${personId}/devices`, query, 'Person Devices');
}

/**
 * Get all groups for a person from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-person-39-s-groups}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} personId The unique identifier (id) or name (targetName) of the person.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - mmcbride
 * @returns {Promise<Group[]>} Array of Group Objects Requested
 */
async function getGroups(env, query, personId) {
  return common.getMany(env, `/api/xm/1/people/${personId}/group-memberships`, query, 'Person Groups');
}

/**
 * Create a person in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-person}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Person} person {@link https://help.xmatters.com/xmapi/index.html#person-object}
 * @returns {Promise<Person>} Person Object Created
 */
async function create(env, person) {
  return common.create(env, '/api/xm/1/people', person, 'Person', true);
}

/**
 * Update a person in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-person}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Person} person {@link https://help.xmatters.com/xmapi/index.html#person-object}
 * @param {string} personId The unique identifier (id) of the person.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Person>} Person Object Updated
 */
async function update(env, person, personId) {
  return common.update(env, '/api/xm/1/people/', person, personId, 'Person');
}

/**
 * Delete a person in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-person}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} personId The unique identifier (id) or name (targetName) of the person.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - mmcbride
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, personId) {
  return common.delete(env, '/api/xm/1/people/', personId, 'Person');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Person[]} people Array of person objects to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, people, destinationData) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  const destinationSites = (destinationData.all ? destinationData.all.sites : null) || destinationData.sites;
  return people.map(person => {
    {
      delete person.links;
      //handle import from xMatters and simpler file import like just the site name.
      if (person.site) {
        person.site = destinationSites.find(
          ({ name }) => person.site.name === name || person.site === name
        ).id;
      }

      if (person.supervisors) {
        person.supervisors = person.supervisors.map(supervisor => {
          const destinationSupervisor = destinationPeople.find(
            //support the xMatters import format and a simpler array of targetNames that might come from a import file.
            destinationPerson =>
              supervisor === destinationPerson.targetName ||
              (supervisor.targetName && supervisor.targetName === destinationPerson.targetName)
          );

          if (!destinationSupervisor) {
            destination.log.warn(
              `DATA INTEGRITY ISSUE: Supervisor mapping failed. Person [${person.targetName}] has a supervisor with targetName [${supervisor.targetName}] but this supervisor was not found in the provided destination data.`
            );
          } else {
            return destinationSupervisor.id;
          }
        });
      }

      //pull any null values from the supervisor array. will be null if matches are not found.
      if (person.supervisors) {
        person.supervisors = person.supervisors.filter(function (el) {
          return el != null;
        });
      }

      //data from xMatters....
      if (person.roles && person.roles.data) {
        person.roles = person.roles.data.map(d => d.name);
      }

      return person;
    }
  });
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  'externalKey',
  //'externallyOwned',
  'firstName',
  //'id',
  'language',
  'lastName',
  'phoneLogin',
  'properties',
  'recipientType',
  'roles',
  'site',
  'status',
  'supervisors',
  'targetName',
  'timezone',
  'webLogin',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Person[]} sourcePeople An array of the person objects to synchronize from the source data.
 * @param {Person[]} destinationPeople An array of the person objects to synchronize from the destination data.
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
async function sync(destination, sourcePeople, destinationPeople, options) {
  return common.syncObject(
    'Person',
    sourcePeople,
    destinationPeople,
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
exports.getDevices = getDevices;
exports.getSupervisors = getSupervisors;
exports.getGroups = getGroups;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
