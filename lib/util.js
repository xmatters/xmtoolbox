const csv = require('csvtojson');
const _rp = require('request-promise');
const rp = async function(options) {
  const retries = options.retries || 3;
  const retryDelay = options.retryDelay || 2000;
  const errorAfterRetries = options.errorAfterRetries || false;

  let attempts = 0;
  while (attempts < retries) {
    try {
      return await _rp(options);
    } catch (error) {
      attempts++;
      console.error(`attempt: ${attempts}`, error.message);
      await sleep(retryDelay);
      if (attempts >= retries && errorAfterRetries) throw error;
    }
  }
};

exports.importCsv = importCsv;
/**
 * Returns json array for each row in CSV file. small wrapper for csvtojson package.
 * @param {*} path path to file
 * @param {*} options csvtojson options. see: https://www.npmjs.com/package/csvtojson
 */
async function importCsv(path, options) {
  return await csv(options).fromFile(path);
}

exports.omit = omit;
/**
 * removes properties from object.
 * @param {Object} obj
 * @param {Array.<string>} props properties to remove in array of strings.
 */
function omit(obj, props) {
  for (let index = 0; index < props.length; index++) {
    delete obj[props[index]];
  }
}

/**
 * builds xmapi query string from object using key/value pairs. Returns a string without leading ?
 * @param {*} object
 */
function queryString(object) {
  let res = '';

  if (object && typeof object === 'object') {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        res += encodeURI(`&${key}=${object[key]}`);
      }
    }
  }
  return res;
}

/**
 * builds a list of request options for paginated results like getPeople.
 * @param {*} total
 * @param {*} auth
 * @param {*} uri
 * @param {*} method
 * @param {*} json
 * @param {number} pageSize Default: 100
 */
function requestList(
  total,
  auth,
  uri,
  method = 'GET',
  json = null,
  pageSize = 100
) {
  const queue = [];
  for (let i = pageSize; i < total; i += pageSize) {
    queue.push({
      method,
      json,
      uri: uri + `&offset=${i}`,
      auth
    });
  }
  return queue;
}

exports.get = get;
/**
 * xmapi get handler
 * @param {*} environment
 * @param {*} api
 * @param {*} id
 * @param {*} query
 * @param {*} label
 */
async function get(
  { baseUrl, limiter, auth, subdomain, log },
  api,
  id,
  query,
  label = null
) {
  const uri = `${baseUrl}${api}${encodeURI(id)}?${queryString(query)}`;
  const options = { method: 'GET', uri, auth };
  log.info(subdomain, label, 'Get', id);
  const body = await limiter.schedule(rp, options);
  log.info(subdomain, label, 'Got', id);

  return JSON.parse(body);
}

exports.getMany = getMany;
/**
 * xmapi get many handler. handles requests where results are paginated.
 *
 * @param {*} environment
 * @param {*} api
 * @param {*} query
 * @param {*} label
 */
async function getMany(
  { baseUrl, limiter, auth, subdomain, log },
  api,
  query,
  label
) {
  let uri = `${baseUrl}${api}?${queryString(query)}`;
  const label2 = query ? JSON.stringify(query) : '';
  log.info(subdomain, label, 'Get Many', label2);

  const options = { method: 'GET', uri, auth };
  const resBody = JSON.parse(await limiter.schedule(rp, options));
  let list = resBody.data;

  const queue = requestList(resBody.total, auth, uri); //queue request for records > 100

  await Promise.all(
    queue.map(async function(options) {
      const { data } = JSON.parse(await limiter.schedule(rp, options));
      list = list.concat(data);
    })
  );

  log.info(subdomain, label, `Got Many (${list.length})`, label2);
  return list;
}

exports.create = create;
/**
 * xmapi create handler.
 * @param {*} environment
 * @param {*} api
 * @param {*} json
 * @param {*} label
 * @param {*} dropId
 */
async function create(
  { baseUrl, limiter, auth, subdomain, log },
  api,
  json,
  label = null,
  dropId = false
) {
  const uri = `${baseUrl}${api}`;
  if (dropId) {
    delete json.id;
  }
  const options = { method: 'POST', uri, auth, json };
  log.info(subdomain, label, 'Create');

  const body = await limiter.schedule(rp, options);
  log.info(subdomain, label, 'Created');
  return body;
}

exports.delete = _delete;
/**
 * xmapi delete handler
 * @param {*} environment
 * @param {*} api
 * @param {*} id
 * @param {*} label
 */
async function _delete(
  { baseUrl, limiter, auth, subdomain, log },
  api,
  id,
  label
) {
  const uri = `${baseUrl}${api}${id}`;
  const options = { method: 'DELETE', uri, auth };
  log.info(subdomain, label, 'Delete', id);
  const body = await limiter.schedule(rp, options);
  log.info(subdomain, label, 'Deleted', id);
  return body;
}

exports.update = update;
/**
 * xmapi update handler
 * @param {} environment
 * @param {*} api
 * @param {*} json
 * @param {*} id
 * @param {*} label
 */
async function update(
  { baseUrl, limiter, auth, subdomain, log },
  api,
  json,
  id,
  label = null
) {
  const uri = `${baseUrl}${api}`;
  json.id = id;
  const options = { method: 'POST', uri, auth, json };
  log.info(subdomain, label, 'Update', id);
  const body = await limiter.schedule(rp, options);
  log.info(subdomain, label, 'Updated', id);
  return body;
}

exports.request = request;
/**
 * wrapper for request-promise
 * @param {} environment
 * @param {*} api
 * @param {*} query
 * @param {*} json
 * @param {*} label
 * @param {*} method
 * @p
 */
async function request(
  { baseUrl, limiter, auth, subdomain, log },
  api,
  query,
  options,
  label = null
) {
  let uri = `${baseUrl}${api}?${queryString(query)}`;
  options.uri = uri;
  options.auth = auth;
  log.info(subdomain, label, options.method);
  const body = await limiter.schedule(rp, options);
  log.info(subdomain, label, options.method);
  return body;
}

/**
 * simple sleep function to add delay where needed.
 * @param {*} ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
