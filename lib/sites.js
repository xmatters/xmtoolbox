const util = require('./util');

/**
 * Returns a Site object that represents a site in xMatters.
 *
 * You can identify a site by its name or identifier. To locate the identifier for a site in the xMatters user interface, use Get Sites or see Locate the identifier for a site. You can access site information if you have permission to either view sites or your own devices in the xMatters user interface.
 *
 * When you request a site, the language code is returned as a two-letter code following the ISO 639 format and the country code is returned as a three-letter code following ISO 3166-2 format.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-site
 *
 * @param {obj} env xMatters Environment
 * @param {string} siteId The unique identifier (id) or name (targetName) of the site.
 *
 * Example:San Ramon
 *
 * Example:960ffa54-b6d3-42b7-8025-7d95ff599976
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} siteId
 * @param {*} query
 */
async function get(env, siteId, query) {
  return util.get(env, '/api/xm/1/sites/', siteId, query, 'Site');
}

/**
 * Returns a pagenated list of sites. Each site contains a unique identifier in the “identifier” field. You can use this identifier with the GET site and POST sites methods to identify the site. To learn how you can locate this identifier in the user interface, see Locate the identifier for a site
 *
 * To return information for a specific site, see Get a Site.
 *
 * When you request a site, the language code is returned as a two-letter code following the ISO 639 format and the country code is returned as a three-letter code following ISO 3166-2 format.
 *
 * https://help.xmatters.com/xmapi/index.html#get-sites
 * @param {obj} env xMatters Environment
 * @param {query} query for sites. Supports all available/documented parameters
 * **Examples:**
 *  - {offset:10, limit:10}: get's 10 sites starting after the 10th site.
 *  - null: include all sites.
 *  - undefined: include all sites
 *
 * **Default:** undefined
 *
 * **--Options--**
 *
 * **offset** Optional: integer
 * The number of items to skip before returning results. See Pagination query parameters.
 * https://help.xmatters.com/xmapi/index.html#pagination-query-param
 *
 * **limit** Optional: integer
 * The number of items to return. See Pagination query parameters.
 * https://help.xmatters.com/xmapi/index.html#pagination-query-param
 *
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/sites', query, 'Sites');
}

/**
 * Creates a new site.
 *
 * To create a new site, make a POST request to /sites and include a Site object in the request body. A new site is created with the properties defined by the Site object. Responses to site creation requests return a JSON object that includes the ID of the newly created site.
 *
 * The unique identifier for a site is included in the response of the GET sites method and is displayed in the xMatters web user interface. For more information about locating this identifier in the user interface, see Locate the identifier for a site
 * @param {obj} env xMatters Environment
 * @param {*} site Object representation of the site to create.
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} site
 */
async function create(env, site) {
  return util.create(env, '/api/xm/1/sites', site, 'Site', true);
}

/**
 *
 * @param {obj} env xMatters Environment
 * @param {*} siteId The UUID of the site you want to modify. To get the ID of a site, use GET sites.
 * @param {*} site Object representation of the site.
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} site
 * @param {*} siteId
 */
async function update(env, site, siteId) {
  return util.update(env, '/api/xm/1/sites/', site, siteId, 'Site');
}

/**
 *
 * @param {obj} env xMatters Environment
 * @param {*} siteId The unique identifier (id) or name (targetName) of the site.
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} siteId
 */
async function _delete(env, siteId) {
  return util.delete(env, '/api/xm/1/sites/', siteId, 'Site');
}

/**
 *
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
  'longitude'
];

/**
 * Function syncs an array of source sites with destination sites and updates the destination as necessary.
 * @param {Array[sites]} sourceSites
 * @param {Array[sites]} destinationSites
 * @param {xMatters Environment Object} destination
 * @param {Object} options see available options below.
 *
 * { fields, mirror, removeNow}
 *
 * fields: default: fields (an array available as an export from this module)
 *
 * This is an array of the properties to sync for a user. Set to undefined to sync all properties.
 *
 * mirror: default: false
 *
 * Set to true to perform a mirror sync. A mirror sync's goal is to remove all sites included in the sourceSites from the destination not included in the destinationSites.
 *
 * removeNow: default: false
 *
 * Use with mirror setting. Set to
 */

/**
 *
 * @param {*} destination
 * @param {*} sourceSites
 * @param {*} destinationSites
 * @param {*} options
 */
async function sync(destination, sourceSites, destinationSites, options) {
  return util.syncObject(
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

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.fields = fields;
exports.sync = sync;
