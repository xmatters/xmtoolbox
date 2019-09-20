const util = require('./util');

exports.get = get;
/**
 * Returns a Site object that represents a site in xMatters.
 *
 * You can identify a site by its name or identifier. To locate the identifier for a site in the xMatters user interface, use Get Sites or see Locate the identifier for a site. You can access site information if you have permission to either view sites or your own devices in the xMatters user interface.
 *
 * When you request a site, the language code is returned as a two-letter code following the ISO 639 format and the country code is returned as a three-letter code following ISO 3166-2 format.
 * @param {obj} env xMatters Environment
 * @param {string} id The unique identifier (id) or name (targetName) of the site.
 *
 * Example:San Ramon
 *
 * Example:960ffa54-b6d3-42b7-8025-7d95ff599976
 */
async function get(env, id) {
  var uri = `${env.baseUrl}/api/xm/1/sites/${id}`;

  //Get total number of requests needed to calculate offsets and queue requests.
  const options = { method: 'GET', uri, auth: env.auth };
  const resBodyInit = JSON.parse(await env.limiter.schedule(rp, options));
  let list = resBodyInit.data;

  //queue requests when greater than 100 records.
  const reqOptionsQueue = [];
  for (var i = 100; i < resBodyInit.total; i += 100) {
    reqOptionsQueue.push({
      method: 'GET',
      uri: uri + `?offset=${i}`,
      auth: env.auth
    });
  }

  await Promise.all(
    reqOptionsQueue.map(async function(options) {
      const { data } = JSON.parse(await env.limiter.schedule(rp, options));
      list = list.concat(data);
    })
  );

  return list;
}

exports.getMany = getMany;
/**
 * Returns a pagenated list of sites. Each site contains a unique identifier in the “identifier” field. You can use this identifier with the GET site and POST sites methods to identify the site. To learn how you can locate this identifier in the user interface, see Locate the identifier for a site
 *
 * To return information for a specific site, see Get a Site.
 *
 * When you request a site, the language code is returned as a two-letter code following the ISO 639 format and the country code is returned as a three-letter code following ISO 3166-2 format.
 *
 * https://help.xmatters.com/xmapi/index.html#get-sites
 * @param {obj} env xMatters Environment
 */
async function getMany(env, query) {
  return await util.getMany(env, '/api/xm/1/sites', query, 'Sites');
}

exports.create = create;
/**
 * Creates a new site.
 *
 * To create a new site, make a POST request to /sites and include a Site object in the request body. A new site is created with the properties defined by the Site object. Responses to site creation requests return a JSON object that includes the ID of the newly created site.
 *
 * The unique identifier for a site is included in the response of the GET sites method and is displayed in the xMatters web user interface. For more information about locating this identifier in the user interface, see Locate the identifier for a site
 * @param {obj} env xMatters Environment
 * @param {*} site Object representation of the site to create.
 */
async function create(env, site) {
  return await util.create(
    env,
    '/api/xm/1/sites',
    site,
    `Site ${site.name}`,
    true
  );
}

exports.update = update;
/**
 *
 * @param {obj} env xMatters Environment
 * @param {*} id
 * @param {*} site Object representation of the site.
 */
async function update(env, id, site) {
  return await util.update(env, '/api/xm/1/sites/', site, id, 'Site');
}
