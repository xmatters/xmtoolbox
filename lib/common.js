const _request = require('./request');
const XMTOOLBOX_DEBUG = process.env.XMTOOLBOX_DEBUG == 'true';
/**
 * module with common methods used by other modules.
 *
 * @module common
 */

if (XMTOOLBOX_DEBUG) console.debug('XMTOOLBOX_DEBUG enabled');

const debug = function (log = console, options = {}) {
  if (XMTOOLBOX_DEBUG) {
    const { system, memory } = options;
    const now = new Date();

    log.debug('XMTOOLBOX_DEBUG Start Session:', now);
    if (system) {
      const uptime = require('os').uptime();
      log.debug('System User', require('os').userInfo());
      log.debug('System Uptime', Math.round(uptime / 60 / 60), 'minutes');
      log.debug('System Architecture', require('os').arch());
      log.debug('System Type', require('os').type());
      log.debug('System Platform', require('os').platform());
      log.debug('System Release', require('os').release());
      log.debug('System Load Average', require('os').loadavg());
      log.debug('System Free Memory', Math.round((require('os').freemem() / 1024 / 1024) * 100) / 100, 'MB');
    }
    if (memory) {
      const used = process.memoryUsage();
      log.debug('Memory Stats');
      log.debug('System Free', Math.round((require('os').freemem() / 1024 / 1024) * 100) / 100, 'MB');
      for (let key in used) {
        log.debug('node.js', key, Math.round((used[key] / 1024 / 1024) * 100) / 100, 'MB');
      }
    }
    log.debug('XMTOOLBOX_DEBUG End Session:', now);
  }
};

/**
 * request promise wrapper with retry logic.
 * @param {Object} options request promise options.
 * @param {Object} log Log object with log, error, warn, and info functions.
 * @returns {Promise<Object>} Promise of the request or nothing if error.
 */
const rp = async function (options, log) {
  const retries = options.retries || 3;
  const retryDelay = options.retryDelay || 2000;
  const throwError =
    options.hasOwnProperty('throwError') && options.throwError !== undefined ? options.throwError : true;

  if (!options.timeout) options.timeout = 5000;

  let attempts = 0;
  while (attempts < retries) {
    try {
      return await _request(options);
    } catch (error) {
      if (
        //known error codes
        error.statusCode === 204 ||
        error.statusCode === 400 ||
        error.statusCode === 401 ||
        error.statusCode === 403 ||
        error.statusCode === 404 ||
        error.statusCode === 406 ||
        error.statusCode === 409 ||
        error.statusCode === 415
      ) {
        if (throwError) throw error;

        return { data: null };
      }

      //TODO Remove workaround for xmatters support #152468
      if (error && error.toString().indexOf('validation.scenario.scenario_not_exists_for') > -1) {
        return { data: [] };
      }

      attempts++;
      const details = error.response && error.response.body ? error.response.body : error;
      const level = attempts === 3 ? 'error' : 'warn';
      if (!options.headers) options.headers = {};

      let cleanLog = JSON.stringify(error.options, null, 2);
      cleanLog = cleanLog.replace(/"Authorization": (".+)"/, 'AUTHORIZATION_EXCLUDED');
      if (options.auth && options.auth.pass)
        cleanLog = cleanLog.replace(options.auth.pass, 'PASSWORD_EXCLUDED');

      log[level](
        `attempt: ${attempts}`,
        'Response',
        JSON.stringify(details, null, 2)
          .replace(options.auth.pass, 'PASSWORD_EXCLUDED')
          .replace(/"Authorization": (".+)"/, 'AUTHORIZATION_EXCLUDED'),
        'Request',
        cleanLog
      );
      await sleep(retryDelay);

      if (attempts >= retries && throwError) throw error;
    }
  }
};

/**
 * Removes properties from an object.
 * @param {Object} obj object to delete property from.
 * @param {string[]} props array of string property names to delete from object.
 */
function omit(obj, props) {
  for (let index = 0; index < props.length; index++) {
    delete obj[props[index]];
  }
}

/**
 * Builds a query string from object using key/value pairs.
 * @param {Object} query object
 * @return {string} A uri query string without leading ?
 */
function queryString(query) {
  let res = '';

  if (query && typeof query === 'object') {
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        res += encodeURI(`&${key}=${query[key]}`);
      }
    }
  }
  return res;
}

/**
 * Builds a list of request options for paginated results like getPeople, getGroups, or other paginated endpoints.
 * @param {number} total The number of objects.
 * @param {Object} auth node request auth object.
 * @param {Boolean} throwError Whether or not to throw errors if they are encountered.
 * @param {Object} proxy The proxy object configuration from the environment
 */
function requestList(total, auth, uri, throwError, proxy) {
  const json = null;
  const pageSize = 100;
  const method = 'GET';

  const queue = [];
  for (let i = pageSize; i < total; i += pageSize) {
    queue.push({
      method,
      json,
      uri: uri + `&offset=${i}`,
      auth,
      throwError,
      proxy,
    });
  }
  return queue;
}

/**
 * The xmapi common get api request wrapper. Used for getting an object in the xmapi.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {string} id The identifier for the object. This is used in the URL for the request. The endpoints vary with exactly what this can be but is usually the object's id however some requests allow for the targetName or name.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @returns {Object} Body from from get request response
 */
async function get(
  { baseUrl, limiter, auth, subdomain, log, proxy },
  api,
  id,
  query = {},
  label = '',
  throwError
) {
  const uri = `${baseUrl}${api}${encodeURI(id)}?${queryString(query)}`;
  const options = { method: 'GET', uri, auth, throwError, proxy };
  log.debug('XMAPI:', subdomain, label, 'Get', id);
  const body = await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, 'Got', id);

  return body;
}

/**
 * The xmapi common get api request wrapper for paginated requests. Used for getting all objects in the xmapi that match the query.<br><br>
 * Note: This simplifies and speeds the access to paginated data. This returns all objects in an array. Not the first request from the matching endpoint.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @returns {Object[]} Objects from all body.data arrays concatenated to a single array.
 */
async function getMany(
  { baseUrl, limiter, auth, subdomain, log, proxy },
  api,
  query = {},
  label = '',
  throwError
) {
  let uri = `${baseUrl}${api}?${queryString(query)}`;
  const label2 = query ? JSON.stringify(query) : '';
  log.debug('XMAPI:', subdomain, label, 'Get Many', label2);

  const options = { method: 'GET', uri, auth, throwError, proxy };

  const body = await limitControl(limiter, rp, options, log);

  //TODO: REMOVE THIS WORKAROUND FOR SCENARIOS: https://xmexternal.zendesk.com/agent/tickets/152468
  if (!body) {
    return [];
  }

  //pull data array from res
  let list = body.data;

  const queue = requestList(body.total, auth, uri, throwError, proxy); //queue request for records > 100

  await Promise.all(
    queue.map(async function (options) {
      const { data } = await limitControl(limiter, rp, options, log);
      list = list.concat(data);
    })
  );

  log.debug('XMAPI:', subdomain, label, `Got Many (${list.length})`, label2);
  return list;
}

/**
 * The xmapi common create api request wrapper. Used for creating an object in the xmapi.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {Object} json The object to include in the request body as json
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @param {boolean} dropId Whether or not to drop the id key in the request. If true the id key is deleted before the request is made.
 * @returns {Object} Body from from create request response
 */
async function create(
  { baseUrl, limiter, auth, subdomain, log, readOnly, proxy },
  api,
  json,
  label = '',
  dropId = false,
  throwError
) {
  const name = json.targetName || json.name || '';
  const uri = `${baseUrl}${api}`;
  if (dropId) {
    delete json.id;
  }
  const options = { method: 'POST', uri, auth, json, throwError, proxy };
  log.debug('XMAPI:', subdomain, label, 'Create', name);

  const body = readOnly ? json : await limitControl(limiter, rp, options, log);
  const id = body && body.id ? body.id : '';
  if (id) {
    log.debug('XMAPI:', subdomain, label, 'Created', name, 'id:', id);
  } else {
    log.debug('XMAPI:', subdomain, label, 'Not Created', name);
  }
  return body;
}

/**
 * The xmapi common delete api request wrapper. Used for deleting an object in the xmapi.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {string} id The identifier for the object. This is used in the URL for the request. The endpoints vary with exactly what this can be but is usually the object's id however some requests allow for the targetName or name.
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @returns {Object} Body from from delete request response
 * @name delete
 */
async function _delete(
  { baseUrl, limiter, auth, subdomain, log, readOnly, throwError, proxy },
  api,
  id,
  label = ''
) {
  const uri = `${baseUrl}${api}${id}`;
  const options = { method: 'DELETE', uri, auth, throwError, proxy };
  log.debug('XMAPI:', subdomain, label, 'Delete', 'id:', id);
  const body = readOnly ? id : await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, 'Deleted', 'id:', id);
  return body;
}

/**
 * The xmapi common update api request wrapper. Used for updating an object in the xmapi.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {Object} json The object to include in the request body as json
 * @param {string} id The identifier for the object. This is used in the URL for the request. The endpoints vary with exactly what this can be but is usually the object's id however some requests allow for the targetName or name.
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @returns {Object} Body from from update request response
 */
async function update(
  { baseUrl, limiter, auth, subdomain, log, readOnly, throwError, proxy },
  api,
  json,
  id,
  label = ''
) {
  const name = json.targetName || json.name || '';
  const uri = `${baseUrl}${api}`;
  json.id = id;
  const options = { method: 'POST', uri, auth, json, throwError, proxy };
  log.debug('XMAPI:', subdomain, label, 'Update', name, 'id:', id);
  const body = readOnly ? json : await limitControl(limiter, rp, options, log);
  const _id = body && body.id ? body.id : '';
  if (_id) {
    log.debug('XMAPI:', subdomain, label, 'Updated', name, 'id:', _id);
  } else {
    log.debug('XMAPI:', subdomain, label, 'Not Updated', name);
  }
  return body;
}

/**
 * The xmapi common upload api request wrapper. Used for uploading multipart/form data to the xmapi.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {Object} formData node request formData object to upload
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @returns {Object} Body from from upload request response
 */
async function upload(
  { baseUrl, limiter, auth, subdomain, log, proxy },
  api,
  formData,
  label = '',
  throwError
) {
  const name = formData.targetName || formData.name || '';
  const uri = `${baseUrl}${api}`;
  const headers = { 'Content-Type': 'multipart/form-data' };
  const options = { method: 'POST', uri, auth, formData, headers, throwError, proxy };
  log.debug('XMAPI:', subdomain, label, 'Upload', name);
  const body = readOnly ? formData : await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, 'Upload', name);
  return body;
}

/**
 * wrapper for request-promise
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups'
 * @param {Object} query An object representing the query string parameters for this request.
 * @param {Object} options The node request options for this request.
 * @param {string} label The Label to define what type of object or objects are being acted on with this request. Primarily used for logging.
 * @returns {Object} Body from from create request response
 */
async function request({ baseUrl, limiter, auth, subdomain, log, proxy }, api, query, options, label = '') {
  let uri = `${baseUrl}${api.replace(baseUrl, '')}`;
  if (uri.includes('?')) {
    uri += `&${queryString(query)}`;
  } else {
    uri += `?${queryString(query)}`;
  }
  options.uri = uri;
  if (!(api.includes('apiKey') || (query && query.hasOwnProperty('apiKey')))) {
    options.auth = auth;
  }

  options.proxy = proxy;

  log.debug('XMAPI:', subdomain, label, options.method);
  const body = await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, options.method);
  return body;
}

async function limitControl(limiter, rp, options, log) {
  options.transform = (data, response) => {
    return { headers: response.headers, data };
  };

  const response = await limiter.schedule(rp, options, log);

  /*  if (response.headers.x - concurrentlimit - limit) {
    limiter.set;
  } */

  /*
    x-concurrentlimit-limit:"10000"
    x-concurrentlimit-used:"1"
    x-ratelimit-limit:"60000"
    x-ratelimit-period_in_sec:"60"
    x-ratelimit-used:"1"
 */

  //set new limit if exceeded.

  return response.data;
}

/**
 * A simple sleep function to add delay where needed.
 * @param {number} ms The number of milliseconds to sleep.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Options to set when synchronizing data into xMatters.
 * @typedef {Object} module:common.SyncOptions
 * @property {boolean} mirror Whether or not to remove non-matching objects from the destination xMatters instance when there is no match found in the sourceObjects.<br><br>
 * Default: false
 * @property {boolean} delayRemoval Used only with mirror is true. Whether or not to delete the objects immediately or return an array of objects to be removed later.<br><br>
 * Default: true
 * @property {string[]} fields An array of strings for the keys to compare to determine if an update is needed in the destination. <br><br>
 * default: undefined. <br>
 * If undefined uses all default syncable fields for synchronization.
 */

/**
 * An common object to return the results of synchronizing many objects of a single object type.
 * @typedef {Object} module:common.SyncResults
 * @property {Object[]} synced An array of objects that were created in the destination.
 * @property {Object[]} synced An array of objects that need to be removed due to mirror and delayRemoval being true.
 */

/**
 * Object representation of the data from an xMatters instance or data intended to be removed from an xMatters Instance.
 * @typedef module:common.xMattersDataRemove
 * @type {Object}
 * @property {Device[]} devices Can be an array of devices, targetNames, or ids.
 * @property {DynamicTeam[]} dynamicTeam
 * @property {GroupMember[]} groupMembers
 * @property {Group[]} groups  Can be an array of groups, targetNames, or ids.
 * @property {Integration[]} integrations
 * @property {Person[]} people  Can be an array of people, targetNames, or ids.
 * @property {PlanConstant[]} planConstants
 * @property {PlanEndpoint[]} planEndpoints
 * @property {Plan[]} plans  Can be an array of plans, targetNames, or ids.
 * @property {SharedLibrary[]} sharedlibrary
 * @property {Shift[]} shifts
 * @property {Site[]} sites  Can be an array of sites, names, or ids.
 * @property {Subscription[]} subscriptions  Can be an array of subscriptions or ids.
 * @property {TemporaryAbsence[]} temporaryAbsences  Can be an array of temporaryAbsences or ids.
 */

/**
 * Object representation of the data from an xMatters instance or data intended for an xMatters Instance.
 * @typedef module:common.xMattersData
 * @type {Object}
 * @property {module:common.xMattersDataRemove}
 * @property {Annotation[]} annotations
 * @property {Audit[]} audits
 * @property {DeviceName[]} deviceNames
 * @property {Device[]} devices
 * @property {DeviceType[]} deviceType
 * @property {DynamicTeam[]} dynamicTeam
 * @property {Event[]} events
 * @property {EventSuppression[]} eventSuppressions
 * @property {Form[]} forms
 * @property {GroupMember[]} groupMembers
 * @property {Group[]} groups
 * @property {ImportJob[]} importJobs
 * @property {Integration[]} integrations
 * @property {OnCall[]} onCalls
 * @property {Person[]} people
 * @property {PlanConstant[]} planConstants
 * @property {PlanEndpoint[]} planEndpoints
 * @property {PlanProperty[]} planProperties
 * @property {Plan[]} plans
 * @property {Role[]} roles
 * @property {Scenario[]} scenarios
 * @property {SharedLibrary[]} sharedlibrary
 * @property {Shift[]} shifts
 * @property {Site[]} sites
 * @property {SubscriptionForm[]} subscriptionForms
 * @property {Subscription[]} subscriptions
 * @property {TemporaryAbsence[]} temporaryAbsences
 */

/**
 * Synchronizes an array of objects into xMatters using the available functions. It looks for a match based on the syncField. It then performs object comparison based on the fields list. If source matches it is skipped. If it does not match it updates using the update function or or not available performs a delete and create. If options.mirror is true the object is deleted if a match is not found in the source. If delayedRemoval is true these object are note removed and returned instead for later removal.
 * @param {string} name The
 * @param {Object[]} sourceObjects An array of xMatters Objects to synchronize. These are considered to be all the the objects from the source.
 * @param {Object[]} destinationObjects An array of xMatters Objects to synchronize. These are considered to be the objects from the destination.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of an xMatters instance
 * @param {string[]|string} syncField A string or an array of strings for the keys to identify the source object in the destination objects. Ex: targetName or name.
 * @param {string[]} objectFields The default array (defined in each object module) of strings for the keys to compare to determine if an update is needed in the destination.
 * @param {function} createFunction The function to create an object in xMatters. Needs to match the common create function structure.
 * @param {function} updateFunction The function to update an object in xMatters. Needs to match the common update function structure. If unavailable, set to undefined.
 * @param {function} deleteFunction The function to delete an object in xMatters. Needs to match the common delete function structure.
 * @param {module:common.SyncOptions} options Options object to control the outcome of the sync.
 * @param {string} parentKey Optional: string identifier for the key that represents the parent in the source object. Example: A shift would use the parentKey of 'group'
 * @returns {Promise<module:common.SyncResults>}
 */
async function syncObject(
  name,
  sourceObjects,
  destinationObjects,
  destination,
  syncField,
  objectFields,
  createFunction,
  updateFunction,
  deleteFunction,
  options = {},
  parentKey
) {
  if (!sourceObjects)
    destination.log.error(
      'SYNC:',
      `The sync is set to sync ${name}s but ${name}s were not included in the source data.`
    );

  const fields = options.fields || objectFields;
  const mirror = options.mirror || false;
  const delayRemoval = !(options.delayRemoval === false);
  const syncFields = Array.isArray(syncField) ? syncField : [syncField];
  const continueOnError = options.continueOnError;

  const defaults = getNullDefaults(fields); //Create empty null object for synced fields to remove values from destination when not included in source.
  //const defaults = defaultsDeep(options.defaults, getNullDefaults(fields)); //Create empty null object for synced fields to remove values from destination when not included in source.

  const pendingDelete = [];
  const deleted = [];
  const created = [];
  const updated = [];
  const matched = [];
  const errors = [];
  const synced = await Promise.all(
    sourceObjects.map(async sourceObject => {
      //for objects that require parent references. Pull off the id of the parent from the source object.
      const parentId = sourceObject[parentKey];

      //loop for a match according to the synced fields.
      const matchTarget = pick(sourceObject, syncFields);
      const match = find(destinationObjects, matchTarget);
      const __match = find(destinationObjects, matchTarget);

      const sourceObjectProps = pick(sourceObject, fields);

      if (match) {
        //if match update.
        const destObjectProps = pick(match, fields);
        if (isMatch(destObjectProps, sourceObjectProps)) {
          destination.log.info(`SYNC: Skip ${name} (match):`, match[syncFields[0]]);
          matched.push(match);
          return sourceObject;
        } else {
          const diff = Object.keys(destObjectProps).filter(
            key => !isEqual(destObjectProps[key], sourceObjectProps[key])
          );

          const update = _defaults(sourceObjectProps, defaults);
          destination.log.info(
            `SYNC: Update ${name}:`,
            match[syncFields[0]],
            '[Differences]:',
            diff.join(', ')
          );
          if (typeof updateFunction === 'function') {
            try {
              const result = await updateFunction(destination, update, match.id, parentId);
              updated.push(result);
            } catch (error) {
              destination.log.error(error);
              errors.push({ operation: 'update', error, object: update });
              if (!continueOnError) throw error;
            }

            return sourceObject;
          } else {
            //if there is not an update function, delete then create to update
            destination.log.info(
              `SYNC: Remove ${name} and Add Updated:`,
              sourceObject[syncFields[0]],
              sourceObject.id
            );

            try {
              const result1 = await deleteFunction(destination, match.id, parentId);
              const result2 = await createFunction(destination, update, parentId);
              updated.push(result2);
            } catch (error) {
              destination.log.error(error);
              errors.push({ operation: 'update', error, object: update });
              if (!continueOnError) throw error;
            }

            return sourceObject;
          }
        }
      } else {
        //if not match create object
        destination.log.info(`SYNC: Create ${name}:`, sourceObjectProps[syncFields[0]]);
        omit(sourceObjectProps, 'links');

        //apply defaults, if set.
        //Default will set keys if not already set.
        //Initial will set regardless of record value.
        let record = _defaults(sourceObjectProps, sourceObject.default);
        record = _defaults(sourceObject.initial, record);
        delete record.default;
        delete record.initial;

        try {
          const result = await createFunction(destination, record, parentId);
          created.push(result);
        } catch (error) {
          destination.log.error(error);
          errors.push({ operation: 'create', error, object: record });
          if (!continueOnError) throw error;
        }

        return record;
      }
    })
  );

  //Mirror Mode: Delete ones found in destination not contained in source
  if (mirror) {
    await Promise.all(
      destinationObjects.map(async destinationObject => {
        const match = find(sourceObjects, pick(destinationObject, syncFields));
        if (!match) {
          destination.log.info(
            `SYNC: Remove ${name} (mirror mode):`,
            destinationObject[syncFields[0]],
            destinationObject.id
          );
          if (delayRemoval) {
            pendingDelete.push(destinationObject);
          } else if (typeof deleteFunction === 'function') {
            try {
              const parentId = destinationObject[parentKey];
              const result = await deleteFunction(destination, destinationObject.id, parentId);
              deleted.push(result);
            } catch (error) {
              destination.log.error(error);
              errors.push({ operation: 'delete', error, object: destinationObject });
              if (!continueOnError) throw error;
            }
          }
        }
      })
    );
  }
  return { synced, remove: pendingDelete, created, updated, deleted, matched, errors };
}

/**
 * Assists with ExportToImport functions.
 * Accepts a data object's parent, all destination Parents and the field
 * they are matching on for the parent and update the  parent with
 * the id of the parent in the destination if it exists or
 *
 * @param {Object} childsParent The Object that represents the current child's parent.
 * @param {Object[]} destinationParents An array of the parent objects to find a match.
 * @param {String} matchId The key name from the child that represents the parent.
 * @param {String[]} fields additional fields to match on.
 * @returns {string} child's parent id or matchId id if not available.
 */
function AssignParentObject(childsParent, destinationParents, matchId, fields = []) {
  if (childsParent && matchId && destinationParents) {
    //
    const matchTo = pick(childsParent, fields.concat([matchId]));

    //attempt to find a matching group and use it's id
    if (destinationParents) {
      const destinationParent = destinationParents.find(parent => isMatch(parent, matchTo));
      if (destinationParent && destinationParent.id) {
        return destinationParent.id;
      }
    }
  }

  return childsParent.id;
}

/**
 * Takes an array of strings to return an object with keys for each string included in the array with it's value set to null.
 * @param {string[]} fields
 * @returns {Object} Returns an array of null value keys where the keys match the fields.
 */
function getNullDefaults(fields) {
  const object = {};
  if (Array.isArray(fields)) {
    fields.forEach(field => (object[field] = null));
  }
  return object;
}

function convertDefaultInitial(objects, convert) {
  return objects.map(object => {
    if (object.default && typeof object.default === 'object') object.default = convert(object.default);
    if (object.initial && typeof object.default === 'object') object.initial = convert(object.initial);
    return convert(object);
  });
}

const pick = (object, keys) => {
  const _object = {};

  if (!Array.isArray(keys)) keys = [keys];

  keys.forEach(key => {
    _object[key] = object[key];
  });
  return _object;
};

const find = (items, object) => {
  const keys = Object.keys(object);

  itemLoop: for (let i = 0; i < items.length; i++) {
    const item = items[i];

    keyLoop: for (let ki = 0; ki < keys.length; ki++) {
      if (item[keys[ki]] !== object[keys[ki]]) continue itemLoop;
    }

    return item;
  }
};

// supports string, number, date, functions, regex
// doesn't support buffers, array buffers, error objects, maps, sets, typed Arrays, symbols,
const isEqual = (object, source) => {
  if (object === null || object === undefined || source === null || source === undefined) {
    return object === source;
    /*   } else if (
        typeof source !== typeof source || //not same type
        Array.isArray(source) !== Array.isArray(object) //not both arrays
      ) {
        console.log('isEqual 1');
        return false; */
  }
  if (object.constructor !== source.constructor) {
    return false;
  }
  if (object instanceof Function || object instanceof RegExp) {
    //function or Regex
    return object === source;
  }

  if (object === source || object.valueOf() === source.valueOf()) {
    return true;
  }

  if (Array.isArray(object) && object.length !== source.length) {
    return false;
  }

  if (object instanceof Date) {
    //matches on valueof above. if here, they didn't match.
    return false;
  }

  //if here, need to be object
  if (!(object instanceof Object)) {
    return false;
  }
  if (!(source instanceof Object)) {
    return false;
  }

  //Object, check that they have matching key values for all and validate value for every key
  const keys = Object.keys(object);
  return (
    Object.keys(source).every(function (ki) {
      return keys.indexOf(ki) !== -1;
    }) &&
    keys.every(function (ki) {
      return isEqual(object[ki], source[ki]);
    })
  );
};

/**
 * Compares Objects for match, object can contain more than source
 * @param {*} object
 * @param {*} source
 */
const isMatch = (object, source) => {
  if (!source) return true;
  if (Array.isArray(object) && Array.isArray(source)) {
    return source.every(sItem => object.some(oItem => isEqual(sItem, oItem)));
  } else if (object instanceof Object && source instanceof Object) {
    const keys = Object.keys(source);
    return keys.every(key => isMatch(object[key], source[key]));
  } else {
    return isEqual(object, source);
  }
};

/**
 * if keys from source are undefined in object, they are set on the object and object is returned.
 * @param {*} object
 * @param {*} source
 */
const _defaults = (object, source) => {
  if (!object) return source;
  if (!source) return object;

  const keys = Object.keys(source);

  keys.forEach(key => {
    if (object[key] === undefined) object[key] = source[key];
  });
  return object;
};

const defaultsDeep = (object, source) => {
  if (!object) return source;
  if (!source) return object;

  const keys = Object.keys(source);

  keys.forEach(key => {
    if (object[key] === undefined) {
      object[key] = source[key];
    } else if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      typeof object[key] === 'object' &&
      object[key] !== null
    ) {
      object[key] = defaultsDeep(object[key], source[key]);
    }
  });
  return object;
};

module.exports = {
  debug,
  convertDefaultInitial,
  omit,
  get,
  getMany,
  create,
  update,
  upload,
  request,
  delete: _delete,
  syncObject,
  AssignParentObject,
  pick,
  find,
  isEqual,
  isMatch,
  defaults: _defaults,
  defaultsDeep,
};
