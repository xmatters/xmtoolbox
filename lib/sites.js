const common = require('./common');

/**
 * A module related to xMatters sites.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#sites}
 *
 * @module sites
 */

/**
 * Get a site from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-site}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} siteId The unique identifier (id) or name (name) of the site.<br><br>
 * Examples:<br>
 * - London Building B2
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Site>} Site Object Requested
 */
async function get(env, siteId, query, throwError) {
  return common.get(env, '/api/xm/1/sites/', siteId, query, 'Site', throwError);
}

/**
 * Get all sites from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-sites}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Site[]>} Array of Site Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/sites', query, 'Sites');
}

/**
 * Create a site in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-site}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Site} site {@link https://help.xmatters.com/xmapi/index.html#site-object}
 * @returns {Promise<Site>} Site Object Created
 */
async function create(env, site) {
  return common.create(env, '/api/xm/1/sites', site, 'Site', true);
}

/**
 * Update a site in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-or-update-a-site}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Site} site {@link https://help.xmatters.com/xmapi/index.html#site-object}
 * @param {string} siteId The unique identifier (id) for the site.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Site>} Site Object Updated
 */
async function update(env, site, siteId) {
  return common.update(env, '/api/xm/1/sites/', site, siteId, 'Site');
}

/**
 * Delete a site in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-site}
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} siteId The unique identifier (id) or name (name) of the site.<br><br>
 * Examples:<br>
 * - London Building B2
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, siteId) {
  return common.delete(env, '/api/xm/1/sites/', siteId, 'Site');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Site[]} sites Array of site objects to transform.
 * @returns {Promise}
 */
async function exportToImport(destination, sites) {
  return common.convertDefaultInitial(sites, convert);

  function convert(site) {
    {
      {
        if (site.latitude) site.latitude = Number(site.latitude);
        if (site.longitude) site.longitude = Number(site.longitude);
        return site;
      }
    }
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
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
  'longitude',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Site[]} sourceSites An array of the site objects to synchronize from the source data.
 * @param {Site[]} destinationSites An array of the site objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceSites, destinationSites, options) {
  return common.syncObject(
    'Site',
    sourceSites,
    destinationSites,
    destination,
    'name',
    fields,
    create,
    update,
    _delete,
    options
  );
}

module.exports = {
  get,
  getMany,
  create,
  update,
  delete: _delete,
  exportToImport,
  fields,
  sync,
};
