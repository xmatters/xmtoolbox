const util = require('./util');

/**
 * Returns a Person object that contains a representation of the person.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-person
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {string} personId The unique identifier (id) or name (targetName) of the person. Strings will be URL Encoded.
 *
 * **Examples:**
 *  - jsmith
 *  - E438e9245-b32d-445f-916bd3e07932c892
 * @param {Object} query Optional: Specify data to be returned. Options include:
 *
 * **Examples:**
 * - {embed:'roles,supervisors', at:'2018-11-02T08:00:00.000Z'}
 * - null: exclude all options
 *
 * **Default** { embed: 'roles,supervisors' }
 *
 * **--Options--**
 *
 * **embed** comma separated list of items to include.
 * - roles: includes the person’s roles in the result.
 * - supervisors: includes the person’s supervisors in the result.
 *
 * **at** A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 */
async function get(env, personId, query) {
  return util.get(env, '/api/xm/1/people/', personId, query, 'Person');
}

/**
 * Returns an array of all person objects matching query. If query is omitted, all are returned.
 *
 * https://help.xmatters.com/xmapi/index.html#get-people
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {Object} query object representation of query for getting people. Each will be included.
 * @param {Object} query
 *
 * **Examples:**
 *  - {embed:'roles,devices', search:'troy', site:'San Ramon', Department:'Management'}
 *  - null: include all options.
 *  - undefined: include all options
 *
 * **Default:** undefined
 *
 * **--Options--**
 *
 * **embed** Optional: Specifies what to include in the returned data. One of:
 * - roles
 * - devices
 * - roles,devices
 *
 * **search** Optional: Searches firstName, lastName, targetName, webLogin, phoneNumber, emailAddress
 *
 * **site** Optional: Finds people at a specific site. Use site name.
 *
 * **Custom Field**: NOTE: the value you key is the name of the field (Department in example). The value is what will be matched (Accounting in the example below).
 *
 * Example: {..., 'Department':'Accounting', ...}
 *
 * **at** Optional: A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/people', query, 'People');
}

/**
 * Returns a List of Person objects representing the person's supervisors.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-person-39-s-supervisors
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {string} id The unique identifier (id) or name (targetName) of the person. Strings will be URL Encoded.
 * **Examples:**
 *  - jsmith
 *  - E438e9245-b32d-445f-916bd3e07932c892
 */
async function getSupervisors(env, query, personId) {
  return util.getMany(env, `/api/xm/1/people/${personId}/supervisors`, query, 'Person Supervisors');
}

async function getDevices(env, query, personId) {
  return util.getMany(env, `/api/xm/1/people/${personId}/devices`, query, 'Person Devices');
}

/**
 * Returns a List of Person objects representing the person's supervisors.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-person-39-s-groups
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {string} id The unique identifier (id) or name (targetName) of the person. Strings will be URL Encoded.
 * **Examples:**
 *  - jsmith
 *  - E438e9245-b32d-445f-916bd3e07932c892
 */
async function getGroups(env, query, personId) {
  return util.getMany(env, `/api/xm/1/people/${personId}/group-memberships`, query, 'Person Groups');
}

/**
 *
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {Object} person
 */
async function create(env, person) {
  return util.create(env, '/api/xm/1/people', person, 'Person', true);
}

/**
 * Modifies the properties of a user in xMatters.
 *
 * Provide the identifier of the person you want to modify in the id field and then specify the properties that you want to modify. If the id field is not included xMatters treats this as a request to create a new person. If an inaccurate id is submitted with the request, xMatters will do one of two things:
 *
 * If the id provided is not currently in the xMatters system, a new user is created.
 *
 * If the id currently exists in the system, xMatters will modify the existing id with the information provided in the request.
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {*} personId
 * @param {*} person Object representation of the person.
 */
async function update(env, person, personId) {
  return util.update(env, '/api/xm/1/people/', person, personId, 'Person');
}

async function _delete(env, personId) {
  return util.delete(env, '/api/xm/1/people/', personId, 'Person');
}

/**
 * Converts an array of records exported from xMatters to the format needed for import.
 * @param {*} people
 * @param {[obj]} sites an array of updated destination site records to find name matches and apply ids to person records.
 */
async function exportToImport(destination, people, destinationData) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  const destinationSites = (destinationData.all ? destinationData.all.sites : null) || destinationData.sites;
  return people.map(person => {
    {
      delete person.links;
      if (person.site && person.site.name) {
        person.site = destinationSites.find(({ name }) => person.site.name === name).id;
      }

      if (person.supervisors) {
        person.supervisors = person.supervisors.map(supervisor => {
          const destinationSupervisor = destinationPeople.find(
            ({ targetName }) => supervisor.targetName === targetName
          );

          if (!destinationSupervisor) {
            destination.errors.push(
              new Error(
                `DATA INTEGRITY ISSUE: Supervisor mapping failed. Person [${person.targetName}] has a supervisor with targetName [${supervisor.targetName}] but this supervisor was not found in the provided destination data.`
              )
            );
          } else {
            return destinationSupervisor.id;
          }
        });
      }

      //pull any null values from the supervisor array. will be null if matches are not found.
      if (person.supervisors) {
        person.supervisors = person.supervisors.filter(function(el) {
          return el != null;
        });
      }

      person.roles = person.roles.data.map(d => d.name);
      return person;
    }
  });
}

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
  'webLogin'
];
/**
 * Function syncs an array of source people with destination people and updates the destination as necessary.
 * @param {Array[sites]} sourcePeople
 * @param {Array[sites]} destinationPeople
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
 * Set to true to perform a mirror sync. A mirror sync's goal is to remove all people included in the sourcePeople from the destination not included in the destinationPeople.
 *
 * removeNow: default: false
 *
 * Use with mirror setting. Set to
 */
async function sync(destination, sourcePeople, destinationPeople, options) {
  return util.syncObject(
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
