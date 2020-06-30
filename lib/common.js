const _rp = require('request-promise');
const _ = require('lodash');
//prevent ETIMEDOUT error from connections.
process.env.UV_THREADPOOL_SIZE = 128; //https://stackoverflow.com/questions/24320578/node-js-get-request-etimedout-esockettimedout/37946324#37946324

/**
 * module with common methods used by other modules.
 *
 * @module common
 */

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
      return await _rp(options);
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

        return { data: 'null' };
      }

      //TODO Remove workaround for xmatters support #152468
      if (error && error.toString().indexOf('validation.scenario.scenario_not_exists_for') > -1) {
        return '{ "data": [] }';
      }

      attempts++;
      const details = error.response && error.response.body ? error.response.body : error;
      const level = attempts === 3 ? 'error' : 'warn';
      log[level](
        `attempt: ${attempts}`,
        'Response',
        JSON.stringify(details, null, 2).replace(options.auth.pass, 'PASSWORD_EXCLUDED'),
        'Request',
        JSON.stringify(error.options, null, 2).replace(options.auth.pass, 'PASSWORD_EXCLUDED')
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
 * @param {string} uri The URI to request without the offset query parameter.
 * @param {string} method The HTTP
 * @param {Object} json The object to include in the node request.json
 * @param {number} pageSize Default: 100 The number of objects included in a request.
 * @returns {Object[]} An array of request option objects
 */
function requestList(total, auth, uri, method = 'GET', json = null, pageSize = 100) {
  const queue = [];
  for (let i = pageSize; i < total; i += pageSize) {
    queue.push({
      method,
      json,
      uri: uri + `&offset=${i}`,
      auth,
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
async function get({ baseUrl, limiter, auth, subdomain, log }, api, id, query = {}, label = '', throwError) {
  const uri = `${baseUrl}${api}${encodeURI(id)}?${queryString(query)}`;
  const options = { method: 'GET', uri, auth, throwError };
  log.debug('XMAPI:', subdomain, label, 'Get', id);
  const body = await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, 'Got', id);

  return JSON.parse(body);
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
async function getMany({ baseUrl, limiter, auth, subdomain, log }, api, query = {}, label = '', throwError) {
  let uri = `${baseUrl}${api}?${queryString(query)}`;
  const label2 = query ? JSON.stringify(query) : '';
  log.debug('XMAPI:', subdomain, label, 'Get Many', label2);

  const options = { method: 'GET', uri, auth, throwError };

  const response = await limitControl(limiter, rp, options, log);

  //TODO: REMOVE THIS WORKAROUND FOR SCENARIOS: https://xmexternal.zendesk.com/agent/tickets/152468
  if (!response) {
    return [];
  }

  const resBody = JSON.parse(response);
  let list = resBody.data;

  const queue = requestList(resBody.total, auth, uri); //queue request for records > 100

  await Promise.all(
    queue.map(async function (options) {
      const { data } = JSON.parse(await limitControl(limiter, rp, options, log));
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
  { baseUrl, limiter, auth, subdomain, log, readOnly },
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
  const options = { method: 'POST', uri, auth, json, throwError };
  log.debug('XMAPI:', subdomain, label, 'Create', name);

  const body = readOnly ? json : await limitControl(limiter, rp, options, log);
  const id = body && body.id ? body.id : '';
  log.debug('XMAPI:', subdomain, label, 'Created', name, 'id:', id);
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
  { baseUrl, limiter, auth, subdomain, log, readOnly, throwError },
  api,
  id,
  label = ''
) {
  const uri = `${baseUrl}${api}${id}`;
  const options = { method: 'DELETE', uri, auth, throwError };
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
  { baseUrl, limiter, auth, subdomain, log, readOnly, throwError },
  api,
  json,
  id,
  label = ''
) {
  const name = json.targetName || json.name || '';
  const uri = `${baseUrl}${api}`;
  json.id = id;
  const options = { method: 'POST', uri, auth, json, throwError };
  log.debug('XMAPI:', subdomain, label, 'Update', name, 'id:', id);
  const body = readOnly ? json : await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, 'Updated', name, 'id:', id);
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
async function upload({ baseUrl, limiter, auth, subdomain, log }, api, formData, label = '', throwError) {
  const name = formData.targetName || formData.name || '';
  const uri = `${baseUrl}${api}`;
  const headers = { 'Content-Type': 'multipart/form-data' };
  const options = { method: 'POST', uri, auth, formData, headers, throwError };
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
async function request({ baseUrl, limiter, auth, subdomain, log }, api, query, options, label = '') {
  let uri = `${baseUrl}${api.replace(baseUrl, '')}`;
  if (uri.includes('?')) {
    uri += `&${queryString(query)}`;
  } else {
    uri += `?${queryString(query)}`;
  }
  options.uri = uri;
  if (!api.includes('apiKey') && !query.hasOwnProperty('apiKey')) {
    options.auth = auth;
  }

  log.debug('XMAPI:', subdomain, label, options.method);
  const body = await limitControl(limiter, rp, options, log);
  log.debug('XMAPI:', subdomain, label, options.method);
  return body;
}

async function limitControl(limiter, rp, options, log) {
  options.transform = (body, response) => {
    return { headers: response.headers, data: body };
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
 * Object representation of the data from an xMatters instance or data intended for an xMatters Instance.
 * @typedef module:common.xMattersData
 * @type {Object}
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
  const delayRemoval = options.delayRemoval || true;
  const syncFields = Array.isArray(syncField) ? syncField : [syncField];

  const defaults = getNullDefaults(fields); //Create empty null object for synced fields to remove values from destination when not included in source.
  //const defaults = _.defaultsDeep(options.defaults, getNullDefaults(fields)); //Create empty null object for synced fields to remove values from destination when not included in source.

  const pendingDelete = [];
  const deleted = [];
  const created = [];
  const updated = [];
  const matched = [];
  const synced = await Promise.all(
    sourceObjects.map(async sourceObject => {
      //for objects that require parent references. Pull off the id of the parent from the source object.
      const parentId = sourceObject[parentKey];

      //loop for a match according to the synced fields.
      const matchTarget = _.pick(sourceObject, syncFields);
      const match = _.find(destinationObjects, matchTarget);

      if (match) {
        //if match update.

        delete sourceObject.default;
        const sourceObjectProps = _.pick(sourceObject, fields);
        const destObjectProps = _.pick(match, fields);
        if (_.isMatch(destObjectProps, sourceObjectProps)) {
          destination.log.info(`SYNC: Skip ${name} (match):`, match[syncFields[0]]);
          matched.push(match);
          return;
        } else {
          const update = _.defaults(sourceObjectProps, defaults);
          destination.log.info(`SYNC: Update ${name}:`, match[syncFields[0]]);
          if (typeof updateFunction === 'function') {
            updated.push(await updateFunction(destination, update, match.id, parentId));
            return;
          } else {
            //if there is not an update function, delete then create to update
            destination.log.info(
              `SYNC: Remove ${name} and Add Updated:`,
              sourceObject[syncFields[0]],
              sourceObject.id
            );

            await deleteFunction(destination, match.id, parentId);
            updated.push(await createFunction(destination, update, parentId));

            return;
          }
        }
      } else {
        //if not match create object
        destination.log.info(`SYNC: Create ${name}:`, sourceObject[syncFields[0]]);
        omit(sourceObject, 'links');

        //apply defaults, if set.
        const record = _.defaults(sourceObject, sourceObject.default);
        delete record.default;

        created.push(await createFunction(destination, record, parentId));

        return;
      }
    })
  );

  //Mirror Mode: Delete ones found in destination not contained in source
  if (mirror) {
    await Promise.all(
      destinationObjects.map(async destinationObject => {
        const match = _.find(sourceObjects, _.pick(destinationObject, syncFields));
        if (!match) {
          destination.log.info(
            `SYNC: Remove ${name} (mirror mode):`,
            destinationObject[syncFields[0]],
            destinationObject.id
          );
          if (delayRemoval) {
            pendingDelete.push(destinationObject);
          } else if (typeof deleteFunction === 'function') {
            const parentId = destinationObject[parentKey];

            deleted.push(await deleteFunction(destination, destinationObject.id, parentId));
          }
        }
      })
    );
  }
  return { synced, remove: pendingDelete, created, updated, deleted, matched };
}

/**
 * Assists with ExportToImport functions.
 * Accepts a data object's parent, all destination Parents and the field
 * they are matching on for the parent and update the  parent with
 * the id of the parent in the destination if it exists or
 *
 * @param {Object} childsParent The Object that represents the current child's parent.
 * @param {Object[]} destinationParents An array of the parent objects to find a match.
 * @param {String} matchField The key name from the child that represents the parent.
 * @returns {string} child's parent id or matchField id if not available.
 */
function AssignParentObject(childsParent, destinationParents, matchField) {
  if (childsParent) {
    //
    if (childsParent[matchField]) {
      childsParent = childsParent[matchField];
    }
    //attempt to find a matching group and use it's id
    if (destinationParents) {
      const destinationParent = destinationParents.find(parent => parent[matchField] === childsParent);
      if (destinationParent && destinationParent.id) childsParent = destinationParent.id;
    }
  }

  return childsParent;
}

/**
 * Takes an array of strings to return an object with keys for each string included in the array with it's value set to null.
 * @param {string[]} fields
 * @returns {Object} Returns an array of null value keys where the keys match the fields.
 */
function getNullDefaults(fields) {
  return _(fields)
    .mapKeys()
    .mapValues(function () {
      return null;
    })
    .value();
}

exports.omit = omit;
exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.upload = upload;
exports.request = request;
exports.delete = _delete;
exports.syncObject = syncObject;
exports.AssignParentObject = AssignParentObject;
