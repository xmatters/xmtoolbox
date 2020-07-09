//Brannon Vann Custom Request Module 1.0.1

const http = require('http');
const https = require('https');
const util = require('util');
const URL = require('url');

/**
 * A request function to make http requests. Returns a promise that resolved to a string bod response or json if the response header content-type is json. The response may be modified using the transform option.
 *
 * Example Usage
 * (async () => {
 * const json = await request({
 *   uri: 'http://192.168.2.123/api/something',
 *   method: 'POST',
 *   json: { name: 'POST TEST' }
 * });
 * console.log(json);
 * })();
 *
 * @param {Object} options object to make request. Supported keys: uri, method, headers, auth, json, transform.
 *
 * uri: The URI for the request.
 * method: default is 'GET' but other standard https methods are supported (all caps)
 * auth: {user: "", pass: ""}
 * headers: {name: value} headers may be set with this.
 * json: any data for requests for methods like post.
 * transform: a function in the form of (data, body)=> {} to transform the retruned response. Otherwise the data is returned.
 *
 *
 * @returns {Promise}
 */
async function request(options = {}) {
  const { uri, method = 'GET', headers = {}, auth, json, transform, form } = options;

  let query = '';

  if (form) {
    if (!uri.includes('?')) {
      query += '?';
    }

    if (form && typeof form === 'object') {
      for (const key in form) {
        if (form.hasOwnProperty(key)) {
          query += encodeURI(`&${key}=${form[key]}`);
        }
      }
    }
  }

  const _options = URL.parse(uri + query);
  _options.method = method;
  _options.headers = headers;

  if (auth) {
    const { user, pass } = auth;
    _options.headers.Authorization = `Basic ${Buffer.from(user + ':' + pass).toString('base64')}`;
  }

  if (json) {
    _options.headers['content-type'] = 'application/json';
    _options.data = JSON.stringify(json);
  }
  if (_options.data) _options.headers['Content-Length'] = Buffer.byteLength(_options.data);

  const makeRequest = (options, callback) => {
    const library = options.protocol === 'http:' ? http : https;
    const req = library
      .request(options, res => {
        const { statusCode } = res;

        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          if (!statusCode || !statusCode.toString().startsWith('2')) {
            const err = new Error(data);
            err.statusCode = statusCode;
            err.data = data;
            err.options = options;
            callback(err);
          }

          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json'))
            data = JSON.parse(data);

          if (transform) {
            const transformed = transform(data, res);
            return callback(null, transformed);
          } else {
            return callback(null, data);
          }
        });
      })
      .on('error', err => {
        err.options = options;
        callback(err);
      });

    if (options.data) req.write(options.data);

    req.end();
  };

  return await util.promisify(makeRequest)(_options);
}

module.exports = request;
