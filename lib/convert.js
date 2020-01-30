const dict = require('./dictionary');

/**
 *
 * @param {*} rowsJson
 * @param {*} people array of person objects with devices
 * @param {*} sites
 * @param {*} deviceNames
 */
async function userUploadToExport(rowsJson, people, sites, deviceNames) {
  const results = {
    people: [],
    devices: [],
    deleteIds: []
  };
  const ignoreCol = getUserImportIgnoreColumns(deviceNames);
  await Promise.all(
    rowsJson.map(async row => {
      if (!row.Operation || row.Operation === 'process') {
        const person = {};

        person.recipientType = 'PERSON';
        person.targetName = row.User;
        person.status = 'ACTIVE';
        if (row['First Name']) person.firstName = row['First Name'];
        if (row['Last Name']) person.lastName = row['Last Name'];
        if (row.Language) person.language = dict.language.codeByName[row.Language];
        if (row['Time Zone']) person.timezone = row['Time Zone'];
        if (row.User) person.webLogin = row.User;
        if (row.Role) person.roles = row.Role.split('|');
        if (row.Site) person.site = sites.find(site => site.name === row.Site).id;
        if (row['User Supervisor']) person.supervisors = getSupervisors(row['User Supervisor'], people);

        //get custom fields, attributes, or device.
        for (const key in row) {
          if (Object.prototype.hasOwnProperty.call(row, key) && ignoreCol.indexOf(key) < 0) {
            const value = row[key];
            const deviceName = deviceNames.find(({ name }) => name === key);
            if (deviceName.deviceType) {
              //is device
              results.devices.push(getDevice(key, value, deviceName, row.User));
            } else {
              if (!person.properties) properties = {};
              //is custom field or attribute
              person.properties[key] = value.split('|');
            }
          }
        }

        results.people.push(person);
      } else if (row.Operation === 'remove') {
        results.deleteIds.push(row['User ID']);
      }
    })
  );

  return results;
}

/**
 *
 * @param {*} userSupervisor userSupervisor column in user upload.
 *
 * Format is : "{id}|{id}" where id is a UUID for a user's supervisor.
 * @param {*} people
 */
function getSupervisors(userSupervisor, people) {
  if (!userSupervisor) return undefined;

  return userSupervisor.split('|').map(UUID => people.find(({ targetName }) => targetName === UUID).id);
}

function getUserImportIgnoreColumns(deviceNames) {
  const ignoreList = [
    'Operation',
    'Password Status',
    'Last Login',
    'Externally Owned Status',
    'First Name',
    'Language',
    'Last Login',
    'Last Name',
    'Role',
    'Site',
    'Time Zone',
    'User',
    'User Supervisor',
    'UUID'
  ];

  for (let i = 0; i < deviceNames.length; i++) {
    const { name } = deviceNames[i];
    ignoreList.push(name + ' Status', name + ' Valid');
  }
  return ignoreList;
}

function getDevice(name, value, { deviceType }, personTargetName) {
  const device = {
    deviceType,
    name,
    owner: personTargetName,
    targetName: `${personTargetName}|${name}`
  };

  switch (deviceType) {
    case 'EMAIL':
      device.emailAddress = value;
      break;
    case 'TEXT_PHONE':
    case 'VOICE':
      device.phoneNumber = value;
      break;
    default:
      break;
  }
  return device;
}

/**
 * called after people are added. This populates the owner property with the person's id
 * @param {*} devices
 * @param {*} people array of current people in the environment. [{targetName, id}] are the only props needed.
 */
function userUploadDevicesToExport(devices, people) {
  for (let index = 0; index < devices.length; index++) {
    const device = devices[index];
    device.owner = people.find(({ targetName }) => targetName === device.owner).id;

    device.recipientType = 'DEVICE';

    if (device.phoneNumber) device.phoneNumber = device.phoneNumber.replace(/\s/g, '');
  }
}

exports.userUploadToExport = userUploadToExport;
exports.userUploadDevicesToExport = userUploadDevicesToExport;
