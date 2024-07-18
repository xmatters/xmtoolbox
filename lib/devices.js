const common = require('./common');

/**
 * A module related to xMatters devices.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#devices}
 *
 * @module devices
 */

/**
 * Get a device from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-device}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} deviceId The unique identifier or target name of the device to retrieve. The target name of a device is the user name, followed by the | (pipe) character, followed by the device name.<br><br>
 * Examples:<br>
 * - 254c95ee-4abe-47ea-ae7c-ae84fb4bee4f<br>
 * - mmcbride|Work Phone
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Device>} Device Object Requested
 */
async function get(env, deviceId, query, throwError) {
  return common.get(env, '/api/xm/1/devices/', deviceId, query, 'Device', throwError);
}

/**
 * Get all devices from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-devices}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Device[]>} Array of Device Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/devices/', query, 'Devices');
}

/**
 * Create a device in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-device}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Device} device {@link https://help.xmatters.com/xmapi/index.html#device-object}
 * @returns {Promise<Device>} Device Object Created
 */
async function create(env, device) {
  delete device.targetName;

  return common.create(env, '/api/xm/1/devices', device, 'Device', true);
}

/**
 * Update a device in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-device}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Device} device {@link https://help.xmatters.com/xmapi/index.html#device-object}
 * @param {string} deviceId The unique identifier (id) of the device you want to modify. You can get this value from the response of Create a device or Get a person’s devices.<br><br>
 * Examples:<br>
 * - 254c95ee-4abe-47ea-ae7c-ae84fb4bee4f<br>
 * @returns {Promise<Device>} Device Object Updated
 */
async function update(env, device, deviceId) {
  delete device.targetName;
  return common.update(env, '/api/xm/1/devices/', device, deviceId, 'Device');
}

/**
 * Delete a device in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-device}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} deviceId The unique identifier (id) or targetName of the device to delete. The targetName of a device is the user name, followed by the | (pipe) character, followed by the device name.<br><br>
 * Examples:<br>
 * - 254c95ee-4abe-47ea-ae7c-ae84fb4bee4f<br>
 * - mmcbride|Work Phone
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, deviceId) {
  return common.delete(env, '/api/xm/1/devices/', deviceId, 'Device');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {Device[]} devices Array of devices to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @param {Object} options
 * @returns {Promise}
 */
async function exportToImport(env, devices, destinationData, options = {}) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return common.convertDefaultInitial(devices, convert);

  function convert(device) {
    {
      delete device.links;

      if (device.owner) {
        //delete record.owner;
        device.owner =
          destinationPeople &&
          destinationPeople.find(
            ({ targetName }) => targetName === device.owner.targetName || targetName === device.owner
          );
        if (device.owner) {
          device.owner = device.owner.id;
        } else {
          env.log.warn(
            `DATA INTEGRITY ISSUE: Device Owner mapping failed. Device [${device.targetName}] has a owner that was not found in the provided destination data.`
          );
        }
      }

      if (device.timeframes && device.timeframes.data) {
        device.timeframes = device.timeframes.data;
      }

      device.recipientType = 'DEVICE';

      if (device.sequence) device.sequence = Number(device.sequence);
      if (device.delay) device.delay = Number(device.delay);

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
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  'name',
  'defaultDevice',
  'delay',
  'description',
  'deviceType',
  'emailAddress',
  'owner',
  'phoneNumber',
  'priorityThreshold',
  'recipientType',
  'sequence',
  'status',
  'targetName',
  'timeframes',
  'provider',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Device[]} sourceDevices An array of the device objects to synchronize from the source data.
 * @param {Device[]} destinationDevices  An array of the device objects to synchronize from the destination data.
 * @param {Object} options
 * @returns {Promise<module:sync.SyncResults>}
 */
async function sync(destination, sourceDevices, destinationDevices, options) {
  return common.syncObject(
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
