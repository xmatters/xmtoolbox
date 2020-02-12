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
  roles: require('./roles'),
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

function DefaultExtractOptions() {
  return {
    audits: false,
    deviceNames: false,
    devices: false,
    deviceTypes: false,
    dynamicTeams: false,
    events: false,
    forms: false,
    groupMembers: false,
    groups: false,
    integrations: false,
    people: false,
    personSupervisors: false,
    planConstants: false,
    planEndpoints: false,
    planProperties: false,
    plans: false,
    roles: false,
    scenarios: false,
    sharedLibraries: false,
    shifts: false,
    sites: false,
    subscriptionForms: false,
    subscriptions: false,
    temporaryAbsences: false
  };
}

/**
 * Get default sync options object.
 * @returns {Object} Default sync options object.
 */
function DefaultSyncOptions() {
  return {
    mirror: false,
    delayRemoval: true,
    defaultSupervisorId: undefined,

    auditsQuery: {},

    devices: false,
    devicesQuery: { embed: 'timeframes' },
    devicesFilter: undefined,
    timeframes: false,

    deviceNamesQuery: {},

    dynamicTeams: false,
    dynamicTeamsQuery: { embed: 'supervisors,observers' },
    dynamicTeamsFilter: undefined,

    eventsQuery: { embed: 'annotations,properties,responseOptions,suppressions,targetedRecipients' },

    //forms: false, not yet supported.
    //formsQuery: { embed: 'recipients' }, //possible to include ',scenarios' but simpler to extract scenarios separately.
    //formsFilter: undefined,

    groups: false,
    groupsQuery: { embed: 'observers,supervisors' },
    groupsFilter: undefined,

    groupMembers: false,
    groupMembersFilter: undefined,
    groupMembersQuery: { embed: 'shifts' },

    importJobsQuery: {},

    integrations: false,
    integrationsQuery: { embed: 'logs' },
    integrationsFilter: undefined,

    onCallQuery: { embed: 'members.owner,shift', membersPerShift: 100 },

    people: false,
    peopleQuery: { embed: 'roles' }, //possible to include ',devices' but simpler to extract devices separately.
    peopleFilter: undefined,
    personSupervisors: false,

    plans: false,
    plansQuery: { embed: 'creator,constants,endpoints,forms,propertyDefinitions,integrations' },
    plansFilter: undefined,

    planConstants: false,
    planConstantsFilter: undefined,

    planEndpoints: false,
    planEndpointsFilter: undefined,

    planProperties: false,
    planPropertiesFilter: undefined,

    rolesQuery: undefined,

    scenarios: false,
    scenariosQuery: { embed: 'properties.translations' },
    scenariosFilter: undefined,

    shifts: false,
    shiftsQuery: { embed: 'members,rotation' },
    shiftsFilter: undefined,

    sharedLibraries: false,
    sharedLibrariesQuery: {},
    sharedLibrariesFilter: undefined,

    sites: false,
    sitesQuery: {},
    sitesFilter: undefined,

    subscriptions: false,
    subscriptionsQuery: {},
    subscriptionsFilter: undefined,

    subscriptionFormsQuery: { embed: 'deviceNames,propertyDefinitions,roles' },

    temporaryAbsences: false,
    temporaryAbsencesQuery: {},
    temporaryAbsencesFilter: undefined
  };
}

/**
 * Helper function to convert the user upload file in JSON format to data object needed to perform a sync with xMatters.
 * @param {*} json the User Upload file converted to a JSON array.
 * @param {*} env
 * @returns {Object}
 */
async function UserUploadToImport(json, env) {
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
 * Synchronizes two xMatters instances according to the sync options.
 * @param {module:environments.xMattersEnvironment} sourceEnv The xmtoolbox representation of the source xMatters instance.
 * @param {module:environments.xMattersEnvironment} destinationEnv The xmtoolbox representation of the destination xMatters instance.
 * @param {module:sync.SyncOptions} syncOptions The sync options that control the synchronization.
 * @returns {Promise}
 */
async function xMattersToxMatters(sourceEnv, destinationEnv, syncOptions = {}) {
  const { mirror } = _.defaultsDeep(syncOptions, DefaultSyncOptions());

  //start sync
  console.time('Sync');

  //get the list(object) of needed data from each instance and extract the data
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

/**
 * Synchronizes a set of data into an instance of xMatters according to the sync options.
 * @param {module:common.xMattersData} sourceData The data to synchronize into xMatters.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {module:sync.SyncOptions} syncOptions The sync options that control the synchronization.
 * @returns {Promise}
 */
async function DataToxMatters(sourceData, env, syncOptions = {}) {
  //set options and defaults.
  const { mirror } = _.defaultsDeep(syncOptions, DefaultSyncOptions());

  //start sync
  console.time('Sync');

  //get the list(object) of needed data from each instance and extract the data
  const destinationData = await ExtractData(env, GetExtractOptions(syncOptions, true), syncOptions);

  //convert objects to import-ready objects and sync into xMatters
  await ConvertAndSyncObjects(sourceData, destinationData, env, syncOptions);

  //FOR MIRROR MODE ONLY after data is added, remove any objects remove dependent data in safe order
  if (mirror) await MirrorOrderedDelete(env, destinationData.syncResults);

  console.timeEnd('Sync');

  //Write out any error with the data.
  env.logErrors();
}

/***
 * Returns the ExtractOptions based on SyncOptions. Useful for producing extraction options needed for a specific sync option set.
 *
 * Returns the data acquired from the environment.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {module:sync.SyncOptions} syncOptions The sync options that control the synchronization.
 * @param {boolean} isDestination whether or not the instance is the target destination instance (where the data is being synced to)
 * @returns {module:sync.ExtractOptions}
 */
function GetExtractOptions(syncOptions, isDestination) {
  const {
    sites,
    people,
    personSupervisors,
    devices,
    groups,
    shifts,
    groupMembers,
    dynamicTeams,
    dynamicTeamsQuery,
    temporaryAbsences,
    plans,
    syncForms,
    integrations,
    planConstants,
    planEndpoints,
    planProperties,
    scenarios,
    sharedLibraries,
    subscriptions
  } = _.defaultsDeep(syncOptions, DefaultSyncOptions());

  const get = {};

  /*
  The data required for extract should be 
  included when the sync[OBJECT] is true. If the
  object is needed for Object's ExportToImport function
  then the data should be included when Sync[Object] and
  isDestination are both true. 
  */

  if (sites) {
    get.sites = true;
  }

  if (people) {
    get.people = true;

    if (isDestination) {
      get.sites = true;
    }
  }

  if (devices) {
    get.devices = true;

    if (isDestination) {
      get.people = true;
    }
  }

  if (groups) {
    get.groups = true;

    if (isDestination) {
      get.sites = true;
      get.people = true;
    }
  }

  if (groupMembers) {
    get.groups = true;

    if (isDestination) {
      get.sites = true;
    }
  }

  if (personSupervisors) {
    //append supervisors to the person objects since supervisors can't be embedded from the request(2020-Jan-29)
    get.personSupervisors = true;
  }

  if (groupMembers) {
    get.groups = true;
    get.groupMembers = true;
  }

  if (dynamicTeams) {
    get.dynamicTeams = true;
    if (
      isDestination &&
      dynamicTeamsQuery.embed &&
      dynamicTeamsQuery.embed.toLowerCase().indexOf('supervisors') > -1
    ) {
      get.people = true;
    }
  }

  if (shifts) {
    // as of 2020-jan-20, there is no ability to get shifts from a groups request
    // so each group must be requested and synced. Also there is not ability to
    // update a shift, only get, delete, and create. A combination of delete
    // and create is used to update shifts.
    get.shifts = true;
    get.groups = true;
    if (isDestination) {
      get.people = true;
    }
  }

  if (syncForms) get.forms = true;

  if (scenarios) {
    get.forms = true;
    get.scenarios = true;
    if (isDestination) {
      get.people = true;
    }
  }

  if (temporaryAbsences) {
    get.temporaryAbsences = true;
    if (isDestination) {
      get.people = true;
    }
  }

  if (plans) {
    get.plans = true;
  }

  if (integrations) {
    get.plans = true;
    get.integrations = true;
    get.forms = true;
  }

  if (planConstants) {
    get.plans = true;
    get.planConstants = true;
  }

  if (planEndpoints) {
    get.plans = true;
    get.planEndpoints = true;
  }

  if (planProperties) {
    get.plans = true;
    get.planProperties = true;
  }

  if (subscriptions) {
    get.plans = true;
    get.subscriptions = true;
    get.subscriptionForms = true;
    if (isDestination) {
      get.people = true;
    }
  }

  if (sharedLibraries) {
    get.plans = true;
    get.sharedLibraries = true;
  }

  return get;
}

/**
 * Returns the data required from an xMatters instance for a sync.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {module:sync.SyncOptions} syncOptions The sync options that control the synchronization.
 * @param {boolean} isDestination
 * @returns {module:common.xMattersData} xMatters Data Object
 */
async function GetSyncData(env, syncOptions, isDestination) {
  const extractOptions = GetExtractOptions(syncOptions, isDestination);
  return await ExtractData(env, extractOptions, syncOptions);
}

/**
 * Extracts data from an xMatters environment according to the options.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {module:sync.ExtractOptions} extractOptions
 * @param {module:sync.SyncOptions} syncOptions
 * @returns {module:common.xMattersData} xMatters Data Object
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
    rolesQuery,
    scenariosQuery,
    sharedLibrariesQuery,
    subscriptionsQuery,
    subscriptionFormsQuery
  } = _.defaultsDeep(syncOptions, DefaultSyncOptions());

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
  }

  if (extractOptions.scenarios && data.forms) {
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

  if (extractOptions.groups) {
    data.groups = await xm.groups.getMany(env, groupsQuery);
  }

  if (extractOptions.shifts && data.groups) {
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

  if (extractOptions.groupMembers && data.groups) {
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

  if (extractOptions.onCall && data.groups) {
    //dependent on data.groups

    let groupsNameLists = [];

    for (let i = 0; i < data.groups.length; i += 30) {
      //get comma separated lists of group names in 30 group increments.
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

  if (extractOptions.importJobs) {
    data.importJobs = await xm.importJobs.getMany(env, importJobsQuery);
  }

  if (extractOptions.people) {
    data.people = await xm.people.getMany(env, peopleQuery);
  }

  if (extractOptions.personSupervisors && data.people) {
    //dependent on data.people
    //append supervisors to the person objects since supervisors can't be embedded from the request(2020-Jan-29)
    data.people = await Promise.all(
      data.people.map(async person => {
        person.supervisors = await xm.people.getSupervisors(env, null, person.id);
        return person;
      })
    );
  }

  if (extractOptions.plans) {
    data.plans = await xm.plans.getMany(env, plansQuery);
  }

  if (extractOptions.integrations && data.plans) {
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

    //append plan name to plan object in integration before returning. (needed for cross-environment mapping.)
    data.integrations = data.integrations.map(integration => {
      integration.plan.name = data.plans.find(({ id }) => {
        return id === integration.plan.id;
      }).name;
      return integration;
    });

    //map forms
    data.integrations = data.integrations.map(integration => {
      //not all integrations have form references. Only map the name for ones that do.
      if (integration.form) {
        integration.form.name = data.forms.find(({ id }) => {
          return id === integration.form.id;
        }).name;
      }
      return integration;
    });
  }

  if (extractOptions.planConstants && data.plans) {
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

      //collect array of plan constants arrays
      const plansConstants = await Promise.all(
        data.plans.map(async ({ id }) => {
          return xm.planConstants.getMany(env, undefined, id);
        })
      );

      //concatenate plan constant objects into single array.
      plansConstants.map(planConstants => (data.planConstants = data.planConstants.concat(planConstants)));

      //append plan name to plan object in plan constants before returning. (needed for cross-environment mapping.)
      data.planConstants = data.planConstants.map(planConstant => {
        planConstant.plan.name = data.plans.find(({ id }) => {
          return id === planConstant.plan.id;
        }).name;
        return planConstant;
      });
    }
  }

  if (extractOptions.planEndpoints && data.plans) {
    //dependent on data.plans
    data.planEndpoints = ExtractDataFromParent(data.plans, 'plan', 'endpoints');
  }

  if (extractOptions.planProperties && data.plans) {
    data.planProperties = ExtractDataFromParent(data.plans, 'plan', 'propertyDefinitions');
  }

  if (extractOptions.sharedLibraries && data.plans) {
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

    //append plan name to plan object in shared library before returning. (needed for cross-environment mapping.)
    /*   data.sharedLibraries = data.sharedLibraries.map(sharedLibrary => {
      sharedLibrary.plan.name = data.plans.find(({ id }) => {
       return id === sharedLibrary.plan.id;
      }).name;
      return sharedLibrary;
    }); */
  }

  if (extractOptions.roles && data.plans) {
    data.roles = await xm.roles.getMany(env, rolesQuery);
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

/***
 * Pulls the child objects from the parents using the child object key name.
 * @param {Object[]} parents parent objects
 * @param {string} parentName parent The name of the child key on the parent object.
 * @param {string} childrenName The name of the key for the child on the parent.
 * @returns {Object[] Array of children objects with references to the parent objects.
 */
function ExtractDataFromParent(parents, parentName, childrenName) {
  let results = [];
  //look at each parent
  parents.map(parent => {
    //if child exists in parent and child is paginated data
    if (parent[childrenName] && Array.isArray(parent[childrenName].data)) {
      //append parent name to child object in constant before returning. (needed for cross-environment mapping.)

      //for each child found in parent
      const children = parent[childrenName].data.map(child => {
        //if child doesn't already have parent reference add a reference to the parent's id and assign to the child[parent]
        if (!child[parentName]) {
          child[parentName] = { id: parent.id };
        }

        //set the child[parent].name to the parent's name value.
        child[parentName].name = parent.name;
        return child;
      });
      //concatenate planConstants objects into single array.
      results = results.concat(children);
    }
  });
  return results;
}

/***
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

/***
 * Perform ExportToImport and Sync Functions for all synced data in appropriate order.
 * @param {xMattersObjects} sourceData The xMatters data for the source.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {module:sync.SyncOptions} syncOptions The sync option used to control the sync functionality.
 */
async function ConvertAndSyncObjects(sourceData, destinationData, env, syncOptions) {
  const {
    mirror,
    delayRemoval,
    defaultSupervisorId,
    sites,
    sitesFilter,
    sitesTransform,
    sitesOptions,
    people,
    personSupervisors,
    peopleFilter,
    peopleTransform,
    peopleOptions,
    devices,
    devicesFilter,
    devicesTransform,
    devicesOptions,
    groups,
    groupsFilter,
    groupsTransform,
    groupsOptions,
    shifts,
    shiftsFilter,
    shiftsTransform,
    shiftsOptions,
    dynamicTeams,
    dynamicTeamsFilter,
    dynamicTeamsTransform,
    dynamicTeamsOptions,
    temporaryAbsences,
    temporaryAbsencesFilter,
    temporaryAbsencesTransform,
    temporaryAbsencesOptions,
    plans,
    groupMembers,
    groupMembersOptions,
    groupMembersFilter,
    groupMembersTransform,
    planConstants,
    planEndpoints,
    planProperties,
    scenarios,
    integrations,
    integrationsTransform,
    integrationsFilter,
    integrationOptions,
    sharedLibraries,
    subscriptions,
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
  } = _.defaultsDeep(syncOptions, DefaultSyncOptions());

  //remove supervisors from the sync fields for people so it doesn't trigger as needing update.
  let peopleFields = peopleOptions && peopleOptions.fields ? peopleOptions.fields : xm.people.fields;
  if (!personSupervisors) peopleFields = peopleFields.filter(e => e !== 'supervisors');

  const _sitesOptions = _.defaultsDeep(sitesOptions, { mirror, delayRemoval });
  const _peopleOptions = _.defaultsDeep(peopleOptions, { mirror, delayRemoval, fields: peopleFields });
  const _devicesOptions = _.defaultsDeep(devicesOptions, { mirror, delayRemoval: false });
  const _groupMembersOptions = _.defaultsDeep(groupMembersOptions, { mirror, delayRemoval: false });
  const _groupsOptions = _.defaultsDeep(groupsOptions, {
    mirror,
    delayRemoval,
    defaultSupervisorId,
    deleteShiftsOnCreate: true
  });
  const _shiftsOptions = _.defaultsDeep(shiftsOptions, { mirror, delayRemoval: false });
  const _dynamicTeamsOptions = _.defaultsDeep(dynamicTeamsOptions, {
    mirror,
    delayRemoval,
    defaultSupervisorId
  });
  const _temporaryAbsencesOptions = _.defaultsDeep(temporaryAbsencesOptions, { mirror, delayRemoval: false });
  const _integrationsOptions = _.defaultsDeep(integrationOptions, { mirror, delayRemoval: false });
  const _plansOptions = _.defaultsDeep(plansOptions, { mirror, delayRemoval: false });
  const _planConstantsOptions = _.defaultsDeep(planConstantsOptions, { mirror, delayRemoval: false });
  const _planEndpointsOptions = _.defaultsDeep(planEndpointsOptions, { mirror, delayRemoval: false });
  const _planPropertiesOptions = _.defaultsDeep(planPropertiesOptions, { mirror, delayRemoval: false });
  const _sharedLibrariesOptions = _.defaultsDeep(sharedLibraryOptions, { mirror, delayRemoval: false });
  const _scenariosOptions = _.defaultsDeep(scenarioOptions, { mirror, delayRemoval: false });
  const _subscriptionsOptions = _.defaultsDeep(subscriptionOptions, { mirror, delayRemoval: false });

  //create ordered array of object types with supporting options.
  const objectNames = [
    [sites, 'sites', sitesFilter, sitesTransform, _sitesOptions],
    [people, 'people', peopleFilter, peopleTransform, _peopleOptions],
    [devices, 'devices', devicesFilter, devicesTransform, _devicesOptions],
    [groups, 'groups', groupsFilter, groupsTransform, _groupsOptions],
    [shifts, 'shifts', shiftsFilter, shiftsTransform, _shiftsOptions],
    [groupMembers, 'groupMembers', groupMembersFilter, groupMembersTransform, _groupMembersOptions],
    [dynamicTeams, 'dynamicTeams', dynamicTeamsFilter, dynamicTeamsTransform, _dynamicTeamsOptions],
    [
      temporaryAbsences,
      'temporaryAbsences',
      temporaryAbsencesFilter,
      temporaryAbsencesTransform,
      _temporaryAbsencesOptions
    ],
    [plans, 'plans', plansFilter, plansTransform, _plansOptions],
    [planConstants, 'planConstants', planConstantsFilter, planConstantsTransform, _planConstantsOptions],
    [planEndpoints, 'planEndpoints', planEndpointsFilter, planEndpointsTransform, _planEndpointsOptions],
    [planProperties, 'planProperties', planPropertiesFilter, planPropertiesTransform, _planPropertiesOptions],
    [
      sharedLibraries,
      'sharedLibraries',
      sharedLibrariesFilter,
      sharedLibrariesTransform,
      _sharedLibrariesOptions
    ],
    [integrations, 'integrations', integrationsFilter, integrationsTransform, _integrationsOptions],
    [scenarios, 'scenarios', scenariosFilter, scenariosTransform, _scenariosOptions],
    [subscriptions, 'subscriptions', subscriptionsFilter, subscriptionsTransform, _subscriptionsOptions]
  ];

  //assign all object tracking for cross object sync use.

  //create empty objects to store results.
  sourceData.all = {};
  sourceData.syncResults = {};
  destinationData.all = {};
  destinationData.syncResults = {};

  //assign each retrieved data to the 'all' object.
  objectNames.map(object => {
    const objectName = object[1];
    destinationData.all[objectName] = destinationData[objectName];
  });

  //sync each object type in order.

  for (let i = 0; i < objectNames.length; i++) {
    const [shouldSync, objectName, filter, transform, options] = objectNames[i];

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
  }
}

/***
 * Remove data from xMatters as deemed necessary for a mirror sync. Data is removed in order necessary to minimize dependency issues.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} syncResults Object with keys for each data object set to the sync results. Ex: {groups: syncResults{...}, people: syncResults{...} }
 * @returns {Promise}
 */
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
exports.UserUploadToImport = UserUploadToImport;
exports.DefaultSyncOptions = DefaultSyncOptions;
exports.DefaultExtractOptions = DefaultExtractOptions;
