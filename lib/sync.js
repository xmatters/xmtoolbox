const _ = require('lodash');
const xm = {
  devices: require('./devices'),
  sites: require('./sites'),
  people: require('./people'),
  groups: require('./groups'),
  shifts: require('./shifts'),
  dynamicTeams: require('./dynamicTeams')
};

const defaultSyncOptions = {
  mirror: false,
  delayRemoval: true,
  defaultSupervisorId: undefined,

  syncSites: false,
  sitesFilter: undefined,

  syncPeople: true,
  peopleQuery: { embed: 'roles,devices' },
  peopleFilter: undefined,
  syncPersonSupervisors: false,

  syncDevices: false,
  devicesFilter: undefined,
  syncTimeframes: false,

  syncGroups: false,
  groupsQuery: { embed: 'observers,supervisors' },
  groupsFilter: undefined,

  syncShifts: false,
  shiftsQuery: { embed: 'members,rotation' },
  shiftsFilter: undefined,

  syncDynamicTeams: false,
  dynamicTeamsQuery: { embed: 'supervisors,observers' },
  dynamicTeamsFilter: undefined,

  syncTemporaryAbsences: false,
  temporaryAbsencesQuery: {},
  temporaryAbsencesFilter: undefined
};

/**
 *
 * @param {*} from
 * @param {*} to
 * @param {*} options
 */
async function xMattersToxMatters(from, to, options = {}) {
  //set options and defaults.

  const {
    mirror,
    delayRemoval,
    defaultSupervisorId,
    syncSites,
    sitesFilter,
    syncPeople,
    peopleQuery,
    peopleFilter,
    syncPersonSupervisors,
    syncDevices,
    devicesFilter,
    syncTimeframes,
    syncGroups,
    groupsQuery,
    groupsFilter,
    syncShifts,
    shiftsQuery,
    shiftsFilter,
    syncDynamicTeams,
    dynamicTeamsQuery,
    dynamicTeamsFilter,
    syncTemporaryAbsences,
    temporaryAbsencesQuery,
    temporaryAbsencesFilter
  } = _.defaultsDeep(options, defaultSyncOptions);

  const siteOptions = { mirror, delayRemoval };
  const personOptions = { mirror, delayRemoval };
  const deviceOptions = { mirror, delayRemoval: false };
  const groupOptions = { mirror, delayRemoval, defaultSupervisorId };
  const shiftOptions = { mirror, delayRemoval: false };
  const dynamicTeamOptions = { mirror, delayRemoval, defaultSupervisorId };
  const temporaryAbsenceOptions = { mirror, delayRemoval: false };

  //start sync
  console.time('xMatters To xMatters Sync');
  const f = { all: {}, syncResults: {} };
  const t = { all: {}, syncResults: {} };

  //overwrite query if devicetimeframes are synced. Devices needed to be requested seperatly in this case.
  if (syncTimeframes) peopleQuery.embed = 'roles';

  //gather baseline data from instances.
  if (syncSites) {
    [f.sites, t.sites] = await Promise.all([xm.sites.getMany(from), xm.sites.getMany(to)]);
  } else if (syncPeople || syncGroups) {
    t.sites = await xm.sites.getMany(to);
  }

  if (syncPeople) {
    [f.people, t.people] = await Promise.all([
      xm.people.getMany(from, peopleQuery),
      xm.people.getMany(to, peopleQuery)
    ]);
  } else if (
    syncGroups ||
    (syncDynamicTeams &&
      dynamicTeamsQuery.embed &&
      dynamicTeamsQuery.embed.toLowerCase().indexOf('supervisors') > -1) ||
    syncTemporaryAbsences
  ) {
    t.people = await xm.people.getMany(to);
  }

  if (syncGroups) {
    [f.groups, t.groups] = await Promise.all([
      xm.groups.getMany(from, groupsQuery),
      xm.groups.getMany(to, groupsQuery)
    ]);
  }

  if (syncDynamicTeams) {
    [f.dynamicTeams, t.dynamicTeams] = await Promise.all([
      xm.dynamicTeams.getMany(from, dynamicTeamsQuery),
      xm.dynamicTeams.getMany(to, dynamicTeamsQuery)
    ]);
  }

  if (syncTemporaryAbsences) {
    [f.temporaryAbsences, t.temporaryAbsences] = await Promise.all([
      xm.temporaryAbsences.getMany(from, temporaryAbsencesQuery),
      xm.temporaryAbsences.getMany(to, temporaryAbsencesQuery)
    ]);
  }

  //assign all object tracking for cross object sync use.
  t.all.sites = t.sites;
  t.all.people = t.people;
  t.all.groups = t.groups;
  t.all.dynamicTeams = t.dynamicTeams;
  t.all.temporaryAbsences = t.temporaryAbsences;

  if (syncSites) {
    await prepAndSyncObject(f, t, to, 'sites', 'sites', sitesFilter, siteOptions);
  }

  if (syncPeople) {
    if (syncPersonSupervisors) {
      //append supervisors to the person objects since supervisors can't be embeded from the request(2020-Jan-29)
      f.people = await Promise.all(
        f.people.map(async p => {
          p.supervisors = (await xm.people.getSupervisors(from, null, p.id)).data;
          return p;
        })
      );

      t.people = await Promise.all(
        t.people.map(async p => {
          p.supervisors = (await xm.people.getSupervisors(to, null, p.id)).data;
          return p;
        })
      );
    }

    await prepAndSyncObject(f, t, to, 'people', 'people', peopleFilter, personOptions);

    if (syncDevices) {
      if (syncTimeframes) {
        //request devices from xMatters as timeframes are not embded on get people requests.
        [f.devices, t.devices] = await Promise.all([
          xm.devices.getMany(from, { embed: 'timeframes' }),
          xm.devices.getMany(to, { embed: 'timeframes' })
        ]);

        f.devices = f.devices.filter(function(device) {
          return t.all.people.some(person => person.targetName === device.owner.targetName);
        });

        t.devices = t.devices.filter(function(device) {
          return t.all.people.some(person => person.targetName === device.owner.targetName);
        });
      } else {
        //pull off devices from users in received from xMatters (embeded in people.)
        f.devices = [];
        for (let i = 0; i < f.people.length; i++) {
          if (f.people[i].devices) {
            f.devices = f.devices.concat(f.people[i].devices.data);
          }
        }

        t.devices = [];
        for (let i = 0; i < t.people.length; i++) {
          if (t.people[i].devices) {
            t.devices = t.devices.concat(t.people[i].devices.data);
          }
        }
      }
      //support device timeframes... requires get for each person.
      await prepAndSyncObject(f, t, to, 'devices', 'devices', devicesFilter, deviceOptions);
    }
  }

  if (syncGroups) {
    await prepAndSyncObject(f, t, to, 'groups', 'groups', groupsFilter, groupOptions);

    if (syncShifts && t.syncResults.groups && t.syncResults.groups.synced) {
      // as of 2020-jan-20, there is no ability to get shifts from a groups request
      // so each group must be requested and synced. also there is not ability to
      // update a shift, only get,delete, and create.

      if (!t.syncResults.shifts) t.syncResults.shifts = { removed: [], synced: [] };
      if (!t.all.shifts) t.all.shifts = [];
      await Promise.all(
        t.syncResults.groups.synced.map(async group => {
          const toGroup = { syncResults: {}, all: { shifts: [], people: t.all.people } };
          const fromGroup = {};
          toGroup.shifts = await xm.shifts.getMany(to, shiftsQuery, group.targetName);
          fromGroup.shifts = await xm.shifts.getMany(from, shiftsQuery, group.targetName);
          await prepAndSyncObject(
            fromGroup,
            toGroup,
            to,
            'shifts',
            'shifts',
            shiftsFilter,
            shiftOptions,
            group.targetName
          );

          t.syncResults.shifts.removed = t.syncResults.shifts.removed.concat(
            toGroup.syncResults.shifts.removed
          );
          t.syncResults.shifts.synced = t.syncResults.shifts.synced.concat(toGroup.syncResults.shifts.synced);
          t.all.shifts = t.all.shifts.concat(toGroup.all.shifts);
        })
      );
    }
  }

  if (syncDynamicTeams) {
    await prepAndSyncObject(f, t, to, 'dynamicTeams', 'dynamicTeams', dynamicTeamsFilter, dynamicTeamOptions);
  }

  if (syncTemporaryAbsences) {
    prepAndSyncObject(
      f,
      t,
      to,
      'temporaryAbsences',
      'temporaryAbsences',
      temporaryAbsencesFilter,
      temporaryAbsenceOptions
    );
  }

  //TODO: return a set of functions rather than elements for delayed execution.
  //Remove delayed removals from mirror syncs, delayed and performed in reverse order of dependency
  ['groups', 'dynamicTeams', 'people', 'sites'].forEach(objectName => {
    const objects = t.syncResults[objectName] ? t.syncResults[objectName].pendingDelete : undefined;
    if (objects) {
      objects.map(async ({ id }) => {
        await xm[objectName].delete(to, id);
      });
    }
  });
  console.timeEnd('xMatters To xMatters Sync');

  //Write out any error with the data.
  to.errors.map(error => {
    console.error(error.message);
  });
}

/**
 *
 * @param {*} sourceData
 * @param {*} destinationData
 * @param {*} destination
 * @param {*} objectName
 * @param {*} module
 * @param {*} filter
 * @param {*} options
 * @param {*} parentId
 */
async function prepAndSyncObject(
  sourceData,
  destinationData,
  destination,
  objectName,
  module,
  filter,
  options,
  parentId
) {
  //if filter exists, run filter for each data set.
  if (filter) {
    sourceData[objectName] = sourceData[objectName].filter(filter);
    destinationData[objectName] = destinationData[objectName].filter(filter);
  }

  //if exportToImport function is implemented
  if (typeof xm[module].exportToImport === 'function') {
    //convert data to import ready data using the 'exportToImport' function
    [sourceData[objectName], destinationData[objectName]] = await Promise.all([
      xm[module].exportToImport(destination, sourceData[objectName], destinationData, options),
      xm[module].exportToImport(destination, destinationData[objectName], destinationData, options)
    ]);
  }

  //run module specific sync
  const syncResults = await xm[module].sync(
    destination,
    sourceData[objectName],
    destinationData[objectName],
    options,
    parentId
  );

  //save sync results to destination data object and concatenate results with the existing allObjectName array.
  destinationData.syncResults[objectName] = syncResults;
  destinationData.all[objectName] = destinationData.all[objectName].concat(syncResults.synced);

  return;
}

exports.xMattersToxMatters = xMattersToxMatters;
