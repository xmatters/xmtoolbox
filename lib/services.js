const common = require('./common');

/**
 * A module related to xMatters services.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#services}
 *
 * @module services
 */

/**
 * Get a service from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-service}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} serviceId The unique identifier (id) of the service.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {service} service Object Requested
 */
async function get(env, serviceId, query) {
  return common.get(env, '/api/xm/1/services/', serviceId, query, 'Services');
}

/**
 * Get all services from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-services}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<service[]>} Array of service Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/services', query, 'Services');
}

/**
 * Create a service in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-service}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {service} service {@link https://help.xmatters.com/xmapi/index.html#service-object}
 * @returns {Promise<service>} service Object Created
 */
async function create(env, service) {
  return common.create(env, '/api/xm/1/services', service, 'Service', true);
}

/**
 * Update a service in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-service}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {service} service {@link https://help.xmatters.com/xmapi/index.html#service-object}
 * @param {string} serviceId The unique identifier (id) for the service.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<service>} service Object Updated
 */
async function update(env, service, serviceId) {
  return common.update(env, '/api/xm/1/services/', service, serviceId, 'Service');
}

/**
 * Delete a service in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-service}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} serviceId The unique identifier (id) for the service.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, serviceId) {
  return common.delete(env, '/api/xm/1/services/', serviceId, 'Service');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {service} services {@link https://help.xmatters.com/xmapi/index.html#service-object}
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, services, destinationData) {
  const destinationServices =
    (destinationData.all ? destinationData.all.services : null) || destinationData.services;
  return common.convertDefaultInitial(await services, convert);

  function convert(service) {
    {
      if (service.description && service.description.data) {
        service.description = service.description.data;
      }
      if (service.ownedBy && service.ownedBy.data) {
        service.ownedBy = service.ownedBy.data;
      }

      return service;
    }
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  //'id',
  //'targetName',
  'description',
  'recipientType',
  'ownedBy',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {service[]} sourceServices An array of the service objects to synchronize from the source data.
 * @param {service[]} destinationServices An array of the service objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceServices, destinationServices, options) {
  return common.syncObject(
    'Service',
    sourceServices,
    destinationServices,
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
