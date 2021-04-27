const http = require('http');
const https = require('https');
const util = require('util');
const URL = require('url');
const tls = require('tls');

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
  const { uri, method = 'GET', headers = {}, auth, json, transform, form, proxy, timeout = 5000 } = options;

  const agent = proxy ? new ProxyAgent(proxy) : undefined;

  let query = '';

  if (form) {
    if (!uri.includes('?')) {
      query += '?';
    }

    if (form && typeof form === 'object') {
      for (const key in form) {
        if (form.hasOwnProperty(key)) {
          query += encodeURIComponent(`&${key}=${form[key]}`);
        }
      }
    }
  }

  const _options = URL.parse(uri + query);
  _options.method = method;
  _options.headers = headers;
  _options.agent = agent;
  _options.timeout = timeout;

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
    const req = library.request(options, res => {
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

        if (
          statusCode !== 204 &&
          res.headers['content-type'] &&
          res.headers['content-type'].includes('application/json')
        )
          data = JSON.parse(data);

        if (transform) {
          const transformed = transform(data, res);
          return callback(null, transformed);
        } else {
          return callback(null, data);
        }
      });
    });

    req.on('error', err => {
      err.options = options;
      callback(err);
    });

    req.on('timeout', () => {
      const err = new Error('Timeout exceeded(' + timeout + 'ms) while making the request.');
      err.statusCode = 408;
      err.errno = 'ETIMEDOUT';
      err.code = 'ETIMEDOUT';
      req.destroy(err);
    });

    if (options.data) req.write(options.data);

    req.end();
  };

  return await util.promisify(makeRequest)(_options);
}

function ProxyAgent(options) {
  https.Agent.call(this, options);

  //proxy options
  const { host, port } = options;

  this.createConnection = function (opts, callback) {
    const req = http.request({
      host,
      port,
      method: 'CONNECT',
      path: opts.host + ':' + opts.port,
      headers: {
        host: opts.host,
      },
    });

    req.on('connect', function (res, socket, head) {
      const cts = tls.connect(
        {
          host: opts.host,
          socket: socket,
        },
        function () {
          callback(false, cts);
        }
      );
    });

    req.on('error', function (err) {
      callback(err, null);
    });

    req.end();
  };
}

util.inherits(ProxyAgent, https.Agent);

ProxyAgent.prototype.addRequest = function (req, options) {
  let name = options.host + ':' + options.port;
  if (options.path) name += ':' + options.path;

  if (!this.sockets[name]) this.sockets[name] = [];

  if (this.sockets[name].length < this.maxSockets) {
    this.createSocket(name, options.host, options.port, options.path, req, function (socket) {
      req.onSocket(socket);
    });
  } else {
    if (!this.requests[name]) this.requests[name] = [];
    this.requests[name].push(req);
  }
};

ProxyAgent.prototype.createSocket = function (name, host, port, localAddress, req, callback) {
  const self = this;
  const options = util._extend({}, self.options);
  options.port = port;
  options.host = host;
  options.localAddress = localAddress;

  options.servername = host;
  if (req) {
    const hostHeader = req.getHeader('host');
    if (hostHeader) options.servername = hostHeader.replace(/:.*$/, '');
  }

  self.createConnection(options, function (err, s) {
    if (err) {
      err.message += ' while connecting to the proxy server ' + self.host + ':' + self.port;

      if (req) req.emit('error', err);
      else throw err;

      return;
    }

    if (!self.sockets[name]) self.sockets[name] = [];

    self.sockets[name].push(s);

    const onFree = function () {
      self.emit('free', s, host, port, localAddress);
    };

    const onClose = function (err) {
      self.removeSocket(s, name, host, port, localAddress);
    };

    const onRemove = function () {
      self.removeSocket(s, name, host, port, localAddress);
      s.removeListener('close', onClose);
      s.removeListener('free', onFree);
      s.removeListener('agentRemove', onRemove);
    };

    s.on('free', onFree);
    s.on('close', onClose);
    s.on('agentRemove', onRemove);

    callback(s);
  });
};

module.exports = request;
