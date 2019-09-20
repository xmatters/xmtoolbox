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
const util = require('./util');

exports.get = get;
async function get(env, id, query) {
  return util.get(env, '/api/xm/1/devices/', id, query);
}

exports.getMany = getMany;
async function getMany(env, query) {
  return await util.getMany(env, '/api/xm/1/devices/', query);
}

exports.create = create;
async function create(env, device) {
  try {
    return await util.create(
      env,
      '/api/xm/1/devices',
      device,
      `Device ${device.owner} ${device.name}`,
      true
    );
  } catch (error) {
    console.log(JSON.stringify(device));
    throw error;
  }
}

exports.update = update;
async function update(env, id, device) {
  return await util.update(
    env,
    '/api/xm/1/devices/',
    device,
    id,
    `Device ${device.owner} ${device.name}`
  );
}

exports.delete = _delete;
async function _delete(env, id) {
  await util.delete(
    env,
    '/api/xm/1/devices/',
    id,
    `Device ${device.owner} ${device.name}`
  );
}

exports.exportToImport = exportToImport;
/**
 * Converts an array of records exported from xMatters to the format needed for import.
 * @param {*} records
 * @param {[obj]} destinationDevices an array of updated destination device records to find targetName matches.
 */
async function exportToImport(records) {
  return records.map(record => {
    {
      delete record.links;
      /*
      if (record.site && record.site.name) {
        record.site = destinationSites.find(
          ({ name }) => record.site.name === name
        ).id;
      }
      */

      record.owner = record.owner.id;
      return record;
    }
  });
}
