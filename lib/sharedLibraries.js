const common = require('./common');

/**
 * A module related to xMatters shared libraries.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#shared-libraries}
 *
 * @module sharedLibraries
 */

/**
 * Get a shared library from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-shared-library}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} sharedLibraryId
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<SharedLibrary>} Shared Library Object Requested
 */
async function get(env, sharedLibraryId, query) {
  return common.get(env, '/api/xm/1/shared-libraries/', sharedLibraryId, query, 'Shared library');
}

/**
 * Get all shared libraries in a communication plan from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-shared-libraries}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - MIM
 * @returns {Promise<SharedLibrary[]>} Array of Shared Library Objects Requested
 */
async function getMany(env, query, planId) {
  return common.getMany(env, `/api/xm/1/plans/${planId}/shared-libraries`, query, 'Shared Libraries');
}

/**
 * Create a shared library in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-shared-library}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {SharedLibrary} sharedLibrary {@link https://help.xmatters.com/xmapi/index.html#shared-library-object}
 * @returns {Promise<SharedLibrary>} Shared Library Object Created
 */
async function create(env, sharedLibrary) {
  return common.create(env, '/api/xm/1/shared-libraries', sharedLibrary, 'Shared Library', true);
}

/**
 * Update a shared library in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-shared-library}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {SharedLibrary} sharedLibrary {@link https://help.xmatters.com/xmapi/index.html#shared-library-object}
 * @param {string} sharedLibraryId The unique identifier (id) of the shared library to delete.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<SharedLibrary>} Shared Library Object Updated
 */
async function update(env, sharedLibrary, sharedLibraryId) {
  return common.update(env, '/api/xm/1/shared-libraries', sharedLibrary, sharedLibraryId, 'Shared Library');
}

/**
 * Delete a shared library in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-shared-library}
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} sharedLibraryId The unique identifier (id) of the shared library to delete.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, sharedLibraryId) {
  await common.delete(env, '/api/xm/1/shared-libraries/', sharedLibraryId, 'Shared Library');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {SharedLibrary} sharedLibraries {@link https://help.xmatters.com/xmapi/index.html#shared-library-object}
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, sharedLibraries, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;
  return common.convertDefaultInitial(await sharedLibraries, convert);

  function convert(sharedLibrary) {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      sharedLibrary.plan = common.AssignParentObject(sharedLibrary.plan, destinationPlans, 'name');

      return sharedLibrary;
    }
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = ['name', 'script'];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {SharedLibrary[]} sourceSharedLibraries An array of the shared library objects to synchronize from the source data.
 * @param {SharedLibrary} destinationSharedLibraries An array of the shared library objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceSharedLibraries, destinationSharedLibraries, options) {
  return common.syncObject(
    'Shared Library',
    sourceSharedLibraries,
    destinationSharedLibraries,
    destination,
    ['name', 'plan'],
    fields,
    create,
    update,
    _delete,
    options,
    'plan'
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
