const util = require('./util');

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

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} deviceId
 * @param {*} query
 */
async function get(env, deviceId, query) {
  return util.get(env, '/api/xm/1/devices/', deviceId, query, 'Device');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/devices/', query, 'Devices');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} device
 */
async function create(env, device) {
  delete device.targetName;

  return util.create(env, '/api/xm/1/devices', device, 'Device', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} device
 * @param {*} deviceId
 */
async function update(env, device, deviceId) {
  delete device.targetName;
  return util.update(env, '/api/xm/1/devices/', device, deviceId, 'Device');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} deviceId
 */
async function _delete(env, deviceId) {
  await util.delete(env, '/api/xm/1/devices/', deviceId, 'Device');
}

/**
 * Converts an array of records exported from xMatters to the format needed for import.
 * @param {*} devices
 * @param {[obj]} destinationDevices an array of updated destination device records to find targetName matches.
 * @param {object} options
 *
 * An object with the available optional keys: {emailGateway, textPhoneGateway, voiceGateway}
 *
 * emailGateway: if provided, the email provider will be overwritten with this value for all EMAIL deviceTypes.
 *
 * textPhoneGateway: if provided, the email provider will be overwritten with this value for all EMAIL deviceTypes.
 *
 * voiceGateway: if provided, the email provider will be overwritten with this value for all EMAIL deviceTypes.
 */

/**
 *
 * @param {*} to
 * @param {*} devices
 * @param {*} destinationData
 * @param {*} options
 */
async function exportToImport(to, devices, destinationData, options = {}) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return devices.map(device => {
    {
      delete device.links;

      //delete record.owner;
      device.owner = destinationPeople.find(({ targetName }) => targetName === device.owner.targetName);
      device.owner = device.owner.id;

      if (device.timeframes && device.timeframes.data) {
        device.timeframes = device.timeframes.data;
      }

      device.recipientType = 'DEVICE';

      if (device.deviceType === 'EMAIL') {
        if (options.emailGateway) {
          device.provider.id = options.emailGateway;
        }
      } else if (device.deviceType === 'TEXT_PHONE') {
        if (options.textPhoneGateway) {
          device.provider.id = options.textPhoneGateway;
        }
      } else if (device.deviceType === 'VOICE') {
        if (options.voiceGateway) {
          device.provider.id = options.voiceGateway;
        }
      }

      if (device.phoneNumber) device.phoneNumber = device.phoneNumber.replace(/\s/g, '');

      return device;
    }
  });
}

const fields = [
  'name',
  'emailAddress',
  'targetName',
  'deviceType',
  'description',
  'defaultDevice',
  'priorityThreshold',
  'sequence',
  'delay',
  'owner',
  'recipientType',
  'status',
  'timeframes'
];

/**
 * Function syncs an array of source devices with destination devices and updates the destination as necessary.
 * @param {Array[sites]} sourceDevices
 * @param {Array[sites]} destinationDevices
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
 * Set to true to perform a mirror sync. A mirror sync's goal is to remove all devices included in the sourceDevices from the destination not included in the destinationDevices.
 *
 * removeNow: default: false
 *
 * Use with mirror setting. Set to
 */

/**
 *
 * @param {*} destination
 * @param {*} sourceDevices
 * @param {*} destinationDevices
 * @param {*} options
 */
async function sync(destination, sourceDevices, destinationDevices, options) {
  return util.syncObject(
    'Device',
    sourceDevices,
    destinationDevices,
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
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
