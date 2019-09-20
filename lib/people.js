const util = require('./util');

exports.get = get;
/**
 * Returns a Person object that contains a representation of the person.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-person
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {string} id The unique identifier (id) or name (targetName) of the person. Strings will be URL Encoded.
 *
 * **Examples:**
 *  - jsmith
 *  - E438e9245-b32d-445f-916bd3e07932c892
 * @param {Object} query Optional: Specify data to be returened. Options include:
 *
 * **Examples:**
 * - {embed:'roles,supervisors', at:'2018-11-02T08:00:00.000Z'}
 * - null: exclude all options
 *
 * **Default** { embed: 'roles,supervisors' }
 *
 * **--Options--**
 *
 * **embed** comma seperated list of items to include.
 * - roles: includes the person’s roles in the result.
 * - supervisors: includes the person’s supervisors in the result.
 *
 * **at** A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 */
async function get(env, id, query = { embed: 'roles,supervisors' }) {
  return util.get(env, '/api/xm/1/people/', id, query);
}

exports.getMany = getMany;
/**
 * Returns an array of all person objects matching query. If query is ommited, all are returned.
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
 * Example: {..., 'Department':'Accouting', ...}
 *
 * **at** Optional: A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 */
async function getMany(env, query) {
  return await util.getMany(env, '/api/xm/1/people', query, 'People');
}

exports.create = create;
/**
 *
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {Object} person
 */
async function create(env, person) {
  return await util.create(
    env,
    '/api/xm/1/people',
    person,
    `Person ${person.targetName}`,
    true
  );
}

exports.update = update;
/**
 * Modifies the properties of a user in xMatters.
 *
 * Provide the identifier of the person you want to modify in the id field and then specify the properties that you want to modify. If the id field is not included xMatters treats this as a request to create a new person. If an inaccruate id is submitted with the request, xMatters will do one of two things:
 *
 * If the id provided is not currently in the xMatters system, a new user is created.
 *
 * If the id currently exists in the system, xMatters will modify the existing id with the information provided in the request.
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {*} id
 * @param {*} person Object representation of the person.
 */
async function update(env, id, person) {
  return await util.update(env, '/api/xm/1/people/', person, id, 'Person');
}

exports.delete = _delete;
async function _delete(env, id) {
  await util.delete(env, '/api/xm/1/people/', id, 'Person');
}

exports.exportToImport = exportToImport;
/**
 * Converts an array of records exported from xMatters to the format needed for import.
 * @param {*} records
 * @param {[obj]} sites an array of updated destination site records to find name matches and apply ids to person records.
 */
async function exportToImport(records, destinationSites) {
  return records.map(record => {
    {
      delete record.links;
      if (record.site && record.site.name) {
        record.site = destinationSites.find(
          ({ name }) => record.site.name === name
        ).id;
      }

      record.roles = record.roles.data.map(d => d.name);
      return record;
    }
  });
}
