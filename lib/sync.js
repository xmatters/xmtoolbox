const xm = {
  devices: require('./devices'),
  sites: require('./sites'),
  people: require('./people'),
  util: require('./util')
};

const _ = require('lodash');

module.exports.sites = sites;
/**
 * Function syncs an array of source sites with destination sites and updates the destination as necessary.
 * @param {Array[sites]} sourceSites
 * @param {Array[sites]} destinationSites
 * @param {xMatters Environment Object} destination
 */
async function sites(
  sourceSites,
  destinationSites,
  destination,
  fields = [
    //'id',
    'name',
    'country',
    'language',
    'timezone',
    //'externallyOwned',
    'status',
    'address1',
    'address2',
    'postalCode',
    'postalCode',
    'city',
    'state',
    'country',
    'latitude',
    'longitude'
  ]
) {
  defaults = getNullDefaults(fields); //Create empty null object for synced fields to remove values from destination when not included in source.

  await Promise.all(
    sourceSites.map(async sourceSite => {
      const match = _.find(destinationSites, _.pick(sourceSite, ['name']));

      if (match) {
        if (_.isMatch(_.pick(match, fields), _.pick(sourceSite, fields))) {
          destination.log.info('SYNC: Skip Site(match):', match.name);
        } else {
          const update = _.defaults(_.pick(sourceSite, fields), defaults);
          destination.log.info('SYNC: Update Site:', match.name);
          await xm.sites.update(destination, match.id, update);
        }
      } else {
        destination.log.info('SYNC: Create Site:', sourceSite.name);
        xm.util.omit(sourceSite, 'links');
        await xm.sites.create(destination, sourceSite);
      }
    })
  );

  //Mirror Mode: Delete ones found in destination not contained in source
  //const match = destinationSites.find(destinationSite => destinationSite.name === sourceSite.name);
  /* NOT SUPPORTED, NO DELETE SITE
  if (mirror) {
    destinationSites.map(destinationSite => {
      const match = sourceSites.find(sourceSite => sourceSites.name === destinationSite.name);
      if (!match) {
        xm.(destination, destinationSite.name);
      }
    });
  }
  */
}

module.exports.peopleFields = peopleFields = [
  'externalKey',
  //'externallyOwned',
  'firstName',
  //'id',
  'language',
  'lastName',
  'phoneLogin',
  //'properties,',
  'recipientType',
  'roles',
  'site',
  'status',
  'supervisors',
  'targetName',
  'timezone',
  'webLogin'
];

module.exports.people = people;
/**
 * Function syncs an array of source sites with destination sites and updates the destination as necessary.
 * @param {Array[sites]} sourcePeople
 * @param {Array[sites]} destinationPeople
 * @param {xMatters Environment Object} destination
 */
async function people(
  sourcePeople,
  destinationPeople,
  destination,
  fields = peopleFields,
  mirror = false
) {
  defaults = getNullDefaults(fields); //Create empty null object for synced fields to remove values from destination when not included in source.

  const current = await Promise.all(
    sourcePeople.map(async sourcePerson => {
      try {
      } catch (error) {}
      const matchTarget = _.pick(sourcePerson, ['targetName']);
      const match = _.find(destinationPeople, matchTarget);

      if (match) {
        const sourcePersonProps = _.pick(sourcePerson, fields);
        const destPersonProps = _.pick(match, fields);
        if (_.isMatch(sourcePersonProps, destPersonProps)) {
          destination.log.info('SYNC: Skip Person(match):', match.targetName);
          return match;
        } else {
          const update = _.defaults(sourcePersonProps, defaults);
          destination.log.info('SYNC: Update Person:', match.targetName);
          return await xm.people.update(destination, match.id, update);
        }
      } else {
        destination.log.info('SYNC: Create Person:', sourcePerson.targetName);
        _.omit(sourcePerson, 'links');
        return await xm.people.create(destination, sourcePerson);
      }
    })
  );

  //Mirror Mode: Delete ones found in destination not contained in source
  if (mirror) {
    promise.all(
      destinationPeople.map(async destinationPerson => {
        const match = _.find(
          sourcePeople,
          _.pick(destinationPerson, ['targetName'])
        );
        if (!match) {
          await xm.people.delete(destination, destinationPerson.targetName);
        }
      })
    );
  }
  return current;
}

module.exports.deviceFields = deviceFields = [
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
  'status'
];

module.exports.devices = devices;
async function devices(
  sourceDevices,
  destinationDevices,
  destination,
  fields = deviceFields,
  mirror = false
) {
  defaults = getNullDefaults(fields); //Create empty null object for synced fields to remove values from destination when not included in source.

  await Promise.all(
    sourceDevices.map(async sourceDevice => {
      const matchTarget = _.pick(sourceDevice, ['targetName']);
      const match = _.find(destinationDevices, matchTarget);

      if (match) {
        const sourceDeviceProps = _.pick(sourceDevice, fields);
        const destDeviceProps = _.pick(match, fields);
        if (_.isMatch(destDeviceProps, sourceDeviceProps)) {
          destination.log.info('SYNC: Skip Device(match):', match.targetName);
        } else {
          //const update = _.defaults(sourceDeviceProps, defaults);
          destination.log.info('SYNC: Update Device:', match.targetName);
          delete sourceDevice.links;
          delete sourceDevice.targetName;
          await xm.devices.update(destination, match.id, sourceDevice);
        }
      } else {
        destination.log.info('SYNC: Create Device:', sourceDevice.targetName);
        delete sourceDevice.links;
        delete sourceDevice.targetName;
        await xm.devices.create(destination, sourceDevice);
      }
    })
  );

  //Mirror Mode: Delete ones found in destination not contained in source
  if (mirror) {
    destinationDevices.map(destinationDevice => {
      const match = _.find(
        sourceDevices,
        _.pick(destinationDevice, ['targetName'])
      );
      if (!match) {
        xm.devices.delete(destination, destinationDevice.targetName);
      }
    });
  }
}

function getNullDefaults(fields) {
  return _(fields)
    .mapKeys()
    .mapValues(function() {
      return null;
    })
    .value();
}
