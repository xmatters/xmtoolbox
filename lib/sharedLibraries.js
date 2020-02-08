const common = require('./common');

/**
 * A module related to xMatters shared libraries.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#shared-libraries}
 *
 * @module sharedLibraries
 */

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibraryId
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function get(env, sharedLibraryId, query) {
  return common.get(env, '/api/xm/1/shared-libraries/', sharedLibraryId, query, 'Shared library');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} commPlanId
 */
async function getMany(env, query, commPlanId) {
  return common.getMany(env, `/api/xm/1/plans/${commPlanId}/shared-libraries`, query, 'Shared Libraries');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibrary
 */
async function create(env, sharedLibrary) {
  return common.create(env, '/api/xm/1/shared-libraries', sharedLibrary, 'Shared Library', true);
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibrary
 * @param {*} sharedLibraryId
 */
async function update(env, sharedLibrary, sharedLibraryId) {
  return common.update(env, '/api/xm/1/shared-libraries', sharedLibrary, sharedLibraryId, 'Shared Library');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} sharedLibraryId
 */
async function _delete(env, sharedLibraryId) {
  await common.delete(env, '/api/xm/1/shared-libraries/', sharedLibraryId, 'Shared Library');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} sharedLibraries
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 */
async function exportToImport(destination, sharedLibraries, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;
  return await sharedLibraries.map(sharedLibrary => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      sharedLibrary.plan = common.AssignParentObject(sharedLibrary.plan, destinationPlans, 'name');

      return sharedLibrary;
    }
  });
}

const fields = ['name', 'script'];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} sourceSharedLibraries
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.SharedLibraries
 * @param {*} options
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
