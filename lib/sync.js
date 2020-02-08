const _ = require('lodash');
const xm = {
  audits: require('./audits'),
  dictionary: require('./dictionary'),
  devices: require('./devices'),
  deviceNames: require('./deviceNames'),
  deviceTypes: require('./deviceTypes'),
  dynamicTeams: require('./dynamicTeams'),
  events: require('./events'),
  forms: require('./forms'),
  groups: require('./groups'),
  groupMembers: require('./groupMembers'),
  integrations: require('./integrations'),
  importJobs: require('./importJobs'),
  onCall: require('./onCall'),
  people: require('./people'),
  plans: require('./plans'),
  planConstants: require('./planConstants'),
  planEndpoints: require('./planEndpoints'),
  planProperties: require('./planProperties'),
  scenarios: require('./scenarios'),
  sharedLibraries: require('./sharedLibraries'),
  shifts: require('./shifts'),
  sites: require('./sites'),
  subscriptionForms: require('./subscriptionForms'),
  subscriptions: require('./subscriptions'),
  temporaryAbsences: require('./temporaryAbsences')
};

/**
 * A module related synchronizing xMatters data<br><br>
 *
 * @module sync
 */

const defaultSyncOptions = {
  mirror: false,
  delayRemoval: true,
  defaultSupervisorId: undefined,

  auditsQuery: {},

  syncDevices: false,
  devicesQuery: { embed: 'timeframes' },
  devicesFilter: undefined,
  syncTimeframes: false,

  deviceNamesQuery: {},

  syncDynamicTeams: false,
  dynamicTeamsQuery: { embed: 'supervisors,observers' },
  dynamicTeamsFilter: undefined,

  eventsQuery: { embed: 'annotations,properties,responseOptions,suppressions,targetedRecipients' },

  syncForms: false,
  formsQuery: { embed: 'recipients' }, //possible to include ',scenarios' but simpler to extract scenarios separately.
  formsFilter: undefined,

  syncGroups: false,
  groupsQuery: { embed: 'observers,supervisors' },
  groupsFilter: undefined,

  syncGroupMembers: false,
  groupMembersFilter: undefined,
  groupMembersQuery: { embed: 'shifts' },

  importJobsQuery: {},

  syncIntegrations: false,
  integrationsQuery: { embed: 'logs' },
  integrationsFilter: undefined,

  onCallQuery: { embed: 'members.owner,shift', membersPerShift: 100 },

  syncPeople: false,
  peopleQuery: { embed: 'roles' }, //possible to include ',devices' but simpler to extract devices separately.
  peopleFilter: undefined,
  syncPersonSupervisors: false,

  syncPlans: false,
  plansQuery: { embed: 'creator,constants,endpoints,forms,propertyDefinitions,integrations' },
  plansFilter: undefined,

  syncPlanConstants: false,
  planConstantsFilter: undefined,

  syncPlanEndpoints: false,
  planEndpointsFilter: undefined,

  syncPlanProperties: false,
  planPropertiesFilter: undefined,

  syncScenarios: false,
  scenariosQuery: { embed: 'properties.translations' },
  scenariosFilter: undefined,

  syncShifts: false,
  shiftsQuery: { embed: 'members,rotation' },
  shiftsFilter: undefined,

  syncSharedLibraries: false,
  sharedLibrariesQuery: {},
  sharedLibrariesFilter: undefined,

  syncSites: false,
  sitesQuery: {},
  sitesFilter: undefined,

  syncSubscriptions: false,
  subscriptionsQuery: {},
  subscriptionsFilter: undefined,

  subscriptionFormsQuery: { embed: 'deviceNames,propertyDefinitions,roles' },

  syncTemporaryAbsences: false,
  temporaryAbsencesQuery: {},
  temporaryAbsencesFilter: undefined
};

/**
 * converts
 * @param {*} json the User Upload file converted to a JSON array.
 * @param {*} env
 */
async function userUploadToImport(json, env) {
  const results = {
    people: [],
    devices: [],
    remove: []
  };

  const deviceNames = await xm.deviceNames.getMany(env);

  const ignoreColumns = [
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
    ignoreColumns.push(name + ' Status', name + ' Valid');
  }

  json.map(row => {
    if (!row.Operation || row.Operation === 'process') {
      const person = {};

      person.recipientType = 'PERSON';
      person.targetName = row.User;
      person.status = 'ACTIVE';
      if (row['First Name']) person.firstName = row['First Name'];
      if (row['Last Name']) person.lastName = row['Last Name'];
      if (row.Language) person.language = xm.dictionary.language.codeByName[row.Language];
      if (row['Time Zone']) person.timezone = row['Time Zone'];
      if (row.User) person.webLogin = row.User;
      if (row.Role) person.roles = row.Role.split('|');
      if (row.Site) person.site = row['Site'];
      if (row['User Supervisor']) person.supervisors = row['User Supervisor'].split('|');

      //get custom fields, attributes, or device.
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key) && ignoreColumns.indexOf(key) < 0) {
          const value = row[key];
          const deviceName = deviceNames.find(({ name }) => name === key);
          if (deviceName.deviceType) {
            //is device

            const device = {
              deviceType: deviceName.deviceType,
              name: key,
              owner: row.User,
              targetName: `${row.User}|${key}`
            };

            switch (device.deviceType) {
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

            results.devices.push(device);
          } else {
            if (!person.properties) person.properties = {};
            //is custom field or attribute
            person.properties[key] = value.split('|');
          }
        }
      }

      results.people.push(person);
    } else if (row.Operation === 'remove') {
      results.remove.push(row['User ID']);
    }
  });

  return results;
}

/**
 *
 * @param {*} sourceEnv
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.Env
 * @param {*} syncOptions
 */
async function xMattersToxMatters(sourceEnv, destinationEnv, syncOptions = {}) {
  const { mirror } = _.defaultsDeep(syncOptions, defaultSyncOptions);

  //start sync
  console.time('Sync');

  //get the list(object) of needed data from each instanc and extract the data
  const [sourceData, destinationData] = await Promise.all([
    ExtractData(sourceEnv, GetExtractOptions(syncOptions), syncOptions),
    ExtractData(destinationEnv, GetExtractOptions(syncOptions, true), syncOptions)
  ]);

  //convert objects to import-ready objects and sync into xMatters
  await ConvertAndSyncObjects(sourceData, destinationData, destinationEnv, syncOptions);

  //FOR MIRROR MODE ONLY after data is added, remove any objects remove dependent data in safe order
  if (mirror) await MirrorOrderedDelete(destinationEnv, destinationData.syncResults);

  console.timeEnd('Sync');

  //Write out any error with the data.
  destinationEnv.logErrors();
}

async function DataToxMatters(sourceData, env, syncOptions = {}) {
  //set options and defaults.
  const { mirror } = _.defaultsDeep(syncOptions, defaultSyncOptions);

  //start sync
  console.time('Sync');

  //get the list(object) of needed data from each instanc and extract the data
  const destinationData = await ExtractData(env, GetExtractOptions(syncOptions, true), syncOptions);

  //convert objects to import-ready objects and sync into xMatters
  await ConvertAndSyncObjects(sourceData, destinationData, env, syncOptions);

  //FOR MIRROR MODE ONLY after data is added, remove any objects remove dependent data in safe order
  if (mirror) await MirrorOrderedDelete(env, destinationData.syncResults);

  console.timeEnd('Sync');

  //Write out any error with the data.
  env.logErrors();
}

/**
 * figures out which data is needed and returns get options object.
 *
 * Returns the data acquired from the environment.
 * @param {*} env
 * @param {*} syncOptions
 * @param {*} isDestination whether or not the instance is the target destionation instance (where the data is being synced to)
 */
function GetExtractOptions(syncOptions, isDestination) {
  const {
    syncSites,
    syncPeople,
    syncPersonSupervisors,
    syncDevices,
    syncGroups,
    syncShifts,
    syncGroupMembers,
    syncDynamicTeams,
    dynamicTeamsQuery,
    syncTemporaryAbsences,
    syncPlans,
    syncForms,
    syncIntegrations,
    syncPlanConstants,
    syncPlanEndpoints,
    syncPlanProperties,
    syncScenarios,
    syncSharedLibraries,
    syncSubscriptions
  } = _.defaultsDeep(syncOptions, defaultSyncOptions);

  const get = {};

  if (syncSites) {
    get.sites = true;
  } else if (isDestination) {
    if (syncPeople || syncGroups) {
      get.sites = true;
    }
  }

  if (syncPeople) {
    get.people = true;
  } else if (isDestination) {
    if (syncGroups) {
      get.people = true;
    } else if (syncSubscriptions) {
      get.people = true;
    } else if (syncTemporaryAbsences) {
      get.people = true;
    } else if (syncScenarios) {
      get.people = true;
    } else if (
      syncDynamicTeams &&
      dynamicTeamsQuery.embed &&
      dynamicTeamsQuery.embed.toLowerCase().indexOf('supervisors') > -1
    ) {
      get.people = true;
    }
  }

  if (syncDevices) get.devices = true;

  if (syncPersonSupervisors) {
    //append supervisors to the person objects since supervisors can't be embeded from the request(2020-Jan-29)
    get.personSupervisors = true;
  }

  if (syncGroups || syncGroupMembers) get.groups = true;

  if (syncGroupMembers) get.groupMembers = true;

  if (syncDynamicTeams) get.dynamicTeams = true;

  if (syncShifts) {
    // as of 2020-jan-20, there is no ability to get shifts from a groups request
    // so each group must be requested and synced. Also there is not ability to
    // update a shift, only get, delete, and create. A combination of delete
    // and create is used to update shifts.
    get.shifts = true;
  }

  if (syncForms || syncScenarios) get.forms = true;

  if (syncScenarios) get.scenarios = true;

  if (syncTemporaryAbsences) get.temporaryAbsences = true;

  if (
    syncPlans ||
    syncIntegrations ||
    syncPlanConstants ||
    syncPlanEndpoints ||
    syncPlanProperties ||
    syncSubscriptions ||
    syncSharedLibraries
  )
    get.plans = true;

  if (syncIntegrations) get.integrations = true;

  if (syncPlanConstants) get.planConstants = true;

  if (syncPlanEndpoints) get.planEndpoints = true;

  if (syncPlanProperties) get.planProperties = true;

  if (syncSubscriptions) {
    get.subscriptions = true;
    get.subscriptionForms = true;
  }

  if (syncSharedLibraries) get.sharedLibraries = true;

  return get;
}

/**
 * returns the data required from an xMatters instance for a sync.
 * @param {*} env
 * @param {*} syncOptions
 * @param {*} isDestination
 */
async function GetSyncData(env, syncOptions, isDestination) {
  const extractOptions = GetExtractOptions(syncOptions, isDestination);
  return await ExtractData(env, extractOptions, syncOptions);
}

/**
 * Extracts data from an xMatteres environment according to the get options.
 * @param {*} env
 * @param {*} extractOptions
 * @param {*} syncOptions
 */
async function ExtractData(env, extractOptions, syncOptions) {
  const {
    auditsQuery,
    peopleQuery,
    devicesQuery,
    deviceNamesQuery,
    eventsQuery,
    formsQuery,
    groupsQuery,
    groupMembersQuery,
    importJobsQuery,
    integrationsQuery,
    onCallQuery,
    shiftsQuery,
    sitesQuery,
    dynamicTeamsQuery,
    temporaryAbsencesQuery,
    plansQuery,
    scenariosQuery,
    sharedLibrariesQuery,
    subscriptionsQuery,
    subscriptionFormsQuery
  } = _.defaultsDeep(syncOptions, defaultSyncOptions);

  const data = {};

  //gather baseline data from instances.

  if (extractOptions.audits) {
    data.audits = await xm.audits.getMany(env, auditsQuery);
  }

  if (extractOptions.devices) {
    data.devices = await xm.devices.getMany(env, devicesQuery);
  }

  if (extractOptions.deviceNames) {
    data.deviceNames = await xm.deviceNames.getMany(env, deviceNamesQuery);
  }

  if (extractOptions.deviceTypes) {
    data.deviceTypes = await xm.deviceTypes.getMany(env);
  }

  if (extractOptions.dynamicTeams) {
    data.dynamicTeams = await xm.dynamicTeams.getMany(env, dynamicTeamsQuery);
  }

  if (extractOptions.events) {
    data.events = await xm.events.getMany(env, eventsQuery);
  }

  if (extractOptions.forms) {
    data.forms = await xm.forms.getMany(env, formsQuery);

    if (extractOptions.scenarios) {
      //dependent on data.forms
      //collect array of integration arrays
      const formsScenarios = await Promise.all(
        data.forms.map(async ({ id, plan }) => {
          const planId = plan.id;
          return xm.scenarios.getMany(env, scenariosQuery, id, planId);
        })
      );

      //concatenate integrations objects into single array.
      if (!data.scenarios) data.scenarios = [];
      formsScenarios.map(formScenarios => (data.scenarios = data.scenarios.concat(formScenarios)));
    }
  }

  if (extractOptions.groups) {
    data.groups = await xm.groups.getMany(env, groupsQuery);

    if (extractOptions.shifts) {
      //dependent on data.groups
      // as of 2020-jan-20, there is no ability to get shifts from a groups request
      // so each group must be requested and synced. Also there is not ability to
      // update a shift, only get, delete, and create. A combination of delete
      // and create is used to update shifts.

      //collect array of shift arrays
      const groupsShifts = await Promise.all(
        data.groups.map(async ({ targetName }) => {
          return xm.shifts.getMany(env, shiftsQuery, targetName);
        })
      );

      //concatenate shift object into single array.
      if (!data.shifts) data.shifts = [];
      groupsShifts.map(shifts => (data.shifts = data.shifts.concat(shifts)));
    }

    if (extractOptions.groupMembers) {
      //dependent on data.groups
      //collect array of groupMembers arrays
      const groupsMembers = await Promise.all(
        data.groups.map(async ({ targetName }) => {
          return xm.groupMembers.getMany(env, groupMembersQuery, targetName);
        })
      );

      //concatenate group roster objects into single array.
      if (!data.groupMembers) data.groupMembers = [];
      groupsMembers.map(groupMembers => (data.groupMembers = data.groupMembers.concat(groupMembers)));
    }

    if (extractOptions.onCall) {
      //dependent on data.groups

      let groupsNameLists = [];

      for (let i = 0; i < data.groups.length; i += 30) {
        //get comma seperated lists of group names in 30 group increments.
        const groupsNameList = data.groups
          .slice(i, i + 30)
          .map(({ name }) => {
            return name.replace(',', '%2C');
          })
          .join(',');

        groupsNameLists = groupsNameLists.concat(groupsNameList);
      }

      //collect array of group on calls arrays
      const groupsOnCalls = await Promise.all(
        groupsNameLists.map(async groupsNameList => {
          //copy query
          const _onCallQuery = JSON.parse(JSON.stringify(onCallQuery));

          //assign groups
          _onCallQuery.groups = groupsNameList;
          return xm.onCall.getMany(env, _onCallQuery);
        })
      );

      //concatenate group roster objects into single array.
      if (!data.onCall) data.onCall = [];
      groupsOnCalls.map(groupOnCalls => (data.onCall = data.onCall.concat(groupOnCalls)));
    }
  }

  if (extractOptions.importJobs) {
    data.importJobs = await xm.importJobs.getMany(env, importJobsQuery);
  }

  if (extractOptions.people) {
    data.people = await xm.people.getMany(env, peopleQuery);

    if (extractOptions.personSupervisors) {
      //dependent on data.people
      //append supervisors to the person objects since supervisors can't be embeded from the request(2020-Jan-29)
      data.people = await Promise.all(
        data.people.map(async person => {
          person.supervisors = await xm.people.getSupervisors(env, null, person.id);
          return person;
        })
      );
    }
  }

  if (extractOptions.plans) {
    data.plans = await xm.plans.getMany(env, plansQuery);

    if (extractOptions.integrations) {
      //data.integrations = ExtractDataFromParent(data.plans, 'plan', 'integrations'); //this does not include logs.
      if (!data.integrations) data.integrations = [];

      //collect array of plan integrations arrays
      const plansIntegrations = await Promise.all(
        data.plans.map(async ({ id }) => {
          return xm.integrations.getMany(env, integrationsQuery, id);
        })
      );

      //concatenate plan integration objects into single array.
      plansIntegrations.map(
        planIntegrations => (data.integrations = data.integrations.concat(planIntegrations))
      );
    }

    if (extractOptions.planConstants) {
      //dependent on data.plans
      data.planConstants = ExtractDataFromParent(data.plans, 'plan', 'constants');

      //check total number of constants.if > 100, handle that.
      if (data.planConstants.length === 100) {
        env.errors.push(
          new Error(
            'EXTRACT',
            'WARNING: Extraction of the plan constants revealed 100 constants.',
            'The api only includes up to 100',
            'Review xMatters support ticket #152488.',
            'Plan Constants will be requested from each plan as a workaround.'
          )
        );

        //clear current constants
        data.planConstants = [];

        //collect array of shared library arrays
        const plansConstants = await Promise.all(
          data.plans.map(async ({ id }) => {
            return xm.planConstants.getMany(env, undefined, id);
          })
        );

        //concatenate shared library objects into single array.
        plansConstants.map(planConstants => (data.planConstants = data.planConstants.concat(planConstants)));

        //append plan name to plan object in shared library before returninig. (needed for cross-environment mapping.)
        data.planConstants = data.planConstants.map(planConstant => {
          planConstant.plan.name = data.plans.find(({ id }) => {
            return id === planConstant.plan.id;
          }).name;
          return planConstant;
        });
      }
    }

    if (extractOptions.planEndpoints) {
      //dependent on data.plans
      data.planEndpoints = ExtractDataFromParent(data.plans, 'plan', 'endpoints');
    }

    if (extractOptions.planProperties) {
      data.planProperties = ExtractDataFromParent(data.plans, 'plan', 'propertyDefinitions');
    }

    if (extractOptions.sharedLibraries) {
      //dependent on data.plans

      if (!data.sharedLibraries) data.sharedLibraries = [];

      //collect array of shared library arrays
      const plansSharedLibraries = await Promise.all(
        data.plans.map(async ({ id }) => {
          return xm.sharedLibraries.getMany(env, sharedLibrariesQuery, id);
        })
      );

      //concatenate shared library objects into single array.
      plansSharedLibraries.map(
        planSharedLibraries => (data.sharedLibraries = data.sharedLibraries.concat(planSharedLibraries))
      );

      //append plan name to plan object in shared library before returninig. (needed for cross-environment mapping.)
      /*   data.sharedLibraries = data.sharedLibraries.map(sharedLibrary => {
        sharedLibrary.plan.name = data.plans.find(({ id }) => {
         return id === sharedLibrary.plan.id;
        }).name;
        return sharedLibrary;
      }); */
    }
  }

  if (extractOptions.sites) {
    data.sites = await xm.sites.getMany(env, sitesQuery);
  }

  if (extractOptions.subscriptionForms) {
    data.subscriptionForms = await xm.subscriptionForms.getMany(env, subscriptionFormsQuery);
  }

  if (extractOptions.subscriptions) {
    data.subscriptions = await xm.subscriptions.getMany(env, subscriptionsQuery);
  }

  if (extractOptions.temporaryAbsences) {
    data.temporaryAbsences = await xm.temporaryAbsences.getMany(env, temporaryAbsencesQuery);
  }

  return data;
}

function ExtractDataFromParent(parents, parentName, childrenName) {
  let results = [];
  //extract children from parents
  parents.map(parent => {
    if (parent[childrenName] && Array.isArray(parent[childrenName].data)) {
      //append parent name to child object in constant before returninig. (needed for cross-environment mapping.)
      const children = parent[childrenName].data.map(child => {
        if (!child[parentName]) {
          child[parentName] = { id: parent.id };
        }
        child[parentName].name = parent.name;
        return child;
      });
      //concatenate planConstants objects into single array.
      results = results.concat(children);
    }
  });
  return results;
}

/**
 *
 * @param {xMattersObjects} sourceData The xMatters data for the source.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} objectName
 * @param {*} module
 * @param {*} filterFunction
 * @param {Object} options
 * @param {*} parentId
 */
async function ConvertAndSyncObject(
  sourceData,
  destinationData,
  destination,
  objectName,
  module,
  filterFunction,
  transformFunction,
  options
) {
  if (typeof transformFunction === 'function') {
    sourceData[objectName] = sourceData[objectName].map(object =>
      transformFunction(object, sourceData, destinationData)
    );
  }

  //if filter exists, run filter for each data set.
  if (typeof filterFunction === 'function') {
    sourceData[objectName] = sourceData[objectName].filter(filterFunction);
    destinationData[objectName] = destinationData[objectName].filter(filterFunction);
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
    options
  );

  //save sync results to destination data object and concatenate results with the existing allObjectName array.
  destinationData.syncResults[objectName] = syncResults;
  destinationData.all[objectName] = destinationData.all[objectName].concat(syncResults.synced);

  return;
}

/**
 * Perform ExportToImport and Sync Functions for synced data.
 * @param {xMattersObjects} sourceData The xMatters data for the source.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @param {*} env
 * @param {Object} options
 */
async function ConvertAndSyncObjects(sourceData, destinationData, env, options) {
  const {
    mirror,
    delayRemoval,
    defaultSupervisorId,
    syncSites,
    sitesFilter,
    sitesTransform,
    sitesOptions,
    syncPeople,
    peopleFilter,
    peopleTransform,
    peopleOptions,
    syncDevices,
    devicesFilter,
    devicesTransform,
    devicesOptions,
    syncGroups,
    groupsFilter,
    groupsTransform,
    groupsOptions,
    syncShifts,
    shiftsFilter,
    shiftsTransform,
    shiftsOptions,
    syncDynamicTeams,
    dynamicTeamsFilter,
    dynamicTeamsTransform,
    dynamicTeamsOptions,
    syncTemporaryAbsences,
    temporaryAbsencesFilter,
    temporaryAbsencesTransform,
    temporaryAbsencesOptions,
    syncPlans,
    syncGroupMembers,
    groupMembersOptions,
    groupMembersFilter,
    groupMembersTransform,
    syncPlanConstants,
    syncPlanEndpoints,
    syncPlanProperties,
    syncScenarios,
    syncSharedLibraries,
    syncSubscriptions,
    plansFilter,
    plansTransform,
    plansOptions,
    planConstantsFilter,
    planConstantsTransform,
    planConstantsOptions,
    planEndpointsFilter,
    planEndpointsTransform,
    planEndpointsOptions,
    planPropertiesFilter,
    planPropertiesTransform,
    planPropertiesOptions,
    sharedLibrariesFilter,
    sharedLibrariesTransform,
    sharedLibraryOptions,
    scenariosFilter,
    scenariosTransform,
    scenarioOptions,
    subscriptionsFilter,
    subscriptionsTransform,
    subscriptionOptions
  } = _.defaultsDeep(options, defaultSyncOptions);

  const _sitesOptions = _.defaultsDeep(sitesOptions, { mirror, delayRemoval });
  const _peopleOptions = _.defaultsDeep(peopleOptions, { mirror, delayRemoval });
  const _devicesOptions = _.defaultsDeep(devicesOptions, { mirror, delayRemoval: false });
  const _groupMembersOptions = _.defaultsDeep(groupMembersOptions, { mirror, delayRemoval: false });
  const _groupsOptions = _.defaultsDeep(groupsOptions, { mirror, delayRemoval, defaultSupervisorId });
  const _shiftsOptions = _.defaultsDeep(shiftsOptions, { mirror, delayRemoval: false });
  const _dynamicTeamsOptions = _.defaultsDeep(dynamicTeamsOptions, {
    mirror,
    delayRemoval,
    defaultSupervisorId
  });
  const _temporaryAbsencesOptions = _.defaultsDeep(temporaryAbsencesOptions, { mirror, delayRemoval: false });
  const _plansOptions = _.defaultsDeep(plansOptions, { mirror, delayRemoval: false });
  const _planConstantsOptions = _.defaultsDeep(planConstantsOptions, { mirror, delayRemoval: false });
  const _planEndpointsOptions = _.defaultsDeep(planEndpointsOptions, { mirror, delayRemoval: false });
  const _planPropertiesOptions = _.defaultsDeep(planPropertiesOptions, { mirror, delayRemoval: false });
  const _sharedLibrariesOptions = _.defaultsDeep(sharedLibraryOptions, { mirror, delayRemoval: false });
  const _scenariosOptions = _.defaultsDeep(scenarioOptions, { mirror, delayRemoval: false });
  const _subscriptionsOptions = _.defaultsDeep(subscriptionOptions, { mirror, delayRemoval: false });

  //create ordered array of object types with supporting options.
  const objectNames = [
    [syncSites, 'sites', sitesFilter, sitesTransform, _sitesOptions],
    [syncPeople, 'people', peopleFilter, peopleTransform, _peopleOptions],
    [syncDevices, 'devices', devicesFilter, devicesTransform, _devicesOptions],
    [syncGroups, 'groups', groupsFilter, groupsTransform, _groupsOptions],
    [syncShifts, 'shifts', shiftsFilter, shiftsTransform, _shiftsOptions],
    [syncGroupMembers, 'groupMembers', groupMembersFilter, groupMembersTransform, _groupMembersOptions],
    [syncDynamicTeams, 'dynamicTeams', dynamicTeamsFilter, dynamicTeamsTransform, _dynamicTeamsOptions],
    [
      syncTemporaryAbsences,
      'temporaryAbsences',
      temporaryAbsencesFilter,
      temporaryAbsencesTransform,
      _temporaryAbsencesOptions
    ],
    [syncPlans, 'plans', plansFilter, plansTransform, _plansOptions],
    [syncPlanConstants, 'planConstants', planConstantsFilter, planConstantsTransform, _planConstantsOptions],
    [syncPlanEndpoints, 'planEndpoints', planEndpointsFilter, planEndpointsTransform, _planEndpointsOptions],
    [
      syncPlanProperties,
      'planPropeties',
      planPropertiesFilter,
      planPropertiesTransform,
      _planPropertiesOptions
    ],
    [
      syncSharedLibraries,
      'sharedLibraries',
      sharedLibrariesFilter,
      sharedLibrariesTransform,
      _sharedLibrariesOptions
    ],
    [syncIntegrations, 'integrations', integrationsFilter, integrationsTransform, _integrationsOptions],
    [syncScenarios, 'scenarios', scenariosFilter, scenariosTransform, _scenariosOptions],
    [syncSubscriptions, 'subscriptions', subscriptionsFilter, subscriptionsTransform, _subscriptionsOptions]
  ];

  //assign all object tracking for cross object sync use.

  //create empty objects to store results.
  sourceData.all = {};
  sourceData.syncResults = {};
  destinationData.all = {};
  destinationData.syncResults = {};

  //assign each retreived data to the 'all' object.
  objectNames.map(object => {
    const objectName = object[1];
    destinationData.all[objectName] = destinationData[objectName];
  });

  //sync each object type in order.
  objectNames.map(async ([shouldSync, objectName, filter, transform, options]) => {
    if (shouldSync) {
      await ConvertAndSyncObject(
        sourceData,
        destinationData,
        env,
        objectName,
        objectName,
        filter,
        transform,
        options
      );
    }
  });
}

async function MirrorOrderedDelete(env, syncResults) {
  //TODO: return a set of functions rather than elements for delayed execution.
  //Remove delayed removals from mirror syncs, delayed and performed in reverse order of dependency

  //name of the objects to delete from, in order.
  const objectNames = ['groups', 'dynamicTeams', 'people', 'sites'];

  objectNames.map(async objectName => {
    if (syncResults[objectName] && syncResults[objectName].pendingDelete) {
      await Promise.all(
        syncResults[objectName].pendingDelete.map(async ({ id }) => {
          await xm[objectName].delete(env, id);
        })
      );
    }
  });
}

exports.GetSyncData = GetSyncData;
exports.ExtractData = ExtractData;
exports.xMattersToxMatters = xMattersToxMatters;
exports.DataToxMatters = DataToxMatters;
exports.userUploadToImport = userUploadToImport;
