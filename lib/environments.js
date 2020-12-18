const Bottleneck = require('bottleneck');
const util = require('./util');
const fs = require('fs');

/**
 * A Module to assist the interaction with an xMatters instance.
 * @module environments
 */

/**
 *
 * @typedef module:environments.Log
 * @type {Object}
 * @property {function} error implements the console.error function if logLevel allows.
 * @property {function} info implements the console.info function if logLevel allows.
 * @property {function} log implements the console.log function if logLevel allows.
 * @property {function} warn implements the console.warn function if logLevel allows.
 */

/**
 *
 * @typedef module:environments.xMattersEnvironment
 * @type {object}
 * @property {string} subdomain - xMatters Instance subdomain.
 *
 * Example: https://SUBDOMAIN.xmatters.com
 *
 * @property {string} auth - A request auth object.
 * @property {string} baseUrl - The base url for the xMatters instance.
 * @property {string} limiter - a Bottleneck limiter for managing the concurrent
 * connections with xMatters.
 * @property {module:environments.Log} log The logging object used to write to the console at the set loglevel only.
 *
 * More information is available here: https://github.com/pimterry/loglevel
 * @property {Object[]} errors - array of errors that are generated.
 * @property {function} logErrors - function to write out errors to the [console] log.
 *
 */

/**
 * @typedef module:environments.EnvironmentOptions
 * @property {string} logLevel The level of logging to output for this environment.<br>
 *<br>
 * Default 'error'<br><br>
 * Set to one of:<br>
 * - 'silent': No console logging<br>
 * - 'error': Only Errors<br>
 * - 'warn': Errors and warnings.<br>
 * - 'info': Errors, warnings, and information.<br>
 * - 'debug': All console messages.<br>
 *
 * @property {boolean} readOnly Whether or not writes and deletes are allowed in this environment.<br>
 *<br>
 * Default: false<br><br>
 * Note: util.post() does not abide by this option.<br>
 * Set to one of:<br><br>
 * - true: Deleting, Updating, and Creating data in xMatters is skipped. returns the intended object as if it was from xMatters.<br>
 * - false: All operations are allowed in the xMatters instance.<br>
 *
 *  * @property {boolean} proxy Enable proxy support by configuring this option.<br>
 *<br>
 * Default: undefined<br><br>
 * Example:<br><br>
 * proxy: { port: 3123, host: '10.10.2.200' } <br>
 * @default {logLevel: 'error', readOnly: false}
 */

/**
 *
 * Create a representation of an xMatters instance with credentials, url, connection
 * management, and logging.
 * The returned object is used to perform other operations in xmtoolbox.
 *
 * @param {string} subdomain - xMatters Instance subdomain.
 *
 * Example: https://SUBDOMAIN.xmatters.com
 *
 * @param {string} user - xMatters username or API Key from user with REST Web Service User Role
 * @param {string} pass - Password for user, API key secret for API key, OR encryption key for .xmpw password file if file exists. File name: subdomain.xmpw in main directory of project.
 *
 * Password needs to be an xMatters password. No SSO/SAML passwords.
 *
 * @param {module:environments.EnvironmentOptions} options
 *
 *
 * @returns {module:environments.xMattersEnvironment}
 * @category environments
 */
function create(subdomain, user, pass, options = {}) {
  const limiter = new Bottleneck({
    maxConcurrent: process.env.MAX_CONCURRENT_CONNECTIONS || 5,
  });

  if (!subdomain) {
    console.error('xMatters subdomain is not defined for environment.');
  }

  const passFilePath = `${subdomain.toLowerCase()}.xmpw`;

  if (fs.existsSync(passFilePath)) {
    const keyName = `XM_KEY_${subdomain.toUpperCase().replace(/\-/g, '_')}`;
    const key = pass || process.env[keyName];
    try {
      if (key) {
        pass = util.DecryptFromFile(passFilePath, key);
      } else {
        console.error('No password or key defined for environment.', subdomain);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const auth = { user, pass };
  const baseUrl = `https://${subdomain}.xmatters.com`;

  const logLevel = options.logLevel || 'error';
  const readOnly = options.readOnly || false;
  const proxy = options.proxy;

  const output = [];
  const errors = [];

  function logErrors() {
    console.warn(
      'env.logErrors() will be removed in future versions. Access env.errors directly for log errors.'
    );
    errors.map(error => {
      console.error(error.message);
    });
  }

  const logLevels = ['silent', 'error', 'warn', 'info', 'debug'];
  let logIndex = logLevels.indexOf(logLevel.toLowerCase());

  if (typeof logIndex !== 'number') logIndex = 1;

  const log = {
    error: function () {
      const args = Array.prototype.slice.call(arguments);
      const e = new Error(args);
      errors.push(e);
      output.push(e.toString());
      logIndex >= 1 ? console.error.apply(null, arguments) : () => {};
    },
    warn:
      logIndex >= 2
        ? function () {
            output.push([].slice.call(arguments).join(' ')) && console.warn.apply(null, arguments);
          }
        : () => {},
    info:
      logIndex >= 3
        ? function () {
            output.push([].slice.call(arguments).join(' ')) && console.info.apply(null, arguments);
          }
        : () => {},
    time: logIndex >= 3 ? console.time : () => {},
    timeEnd: logIndex >= 3 ? console.timeEnd : () => {},
    log:
      logIndex >= 4
        ? function () {
            output.push([].slice.call(arguments).join(' ')) && console.log.apply(null, arguments);
          }
        : () => {},
    debug:
      logIndex >= 4
        ? function () {
            output.push([].slice.call(arguments).join(' ')) && console.debug.apply(null, arguments);
          }
        : () => {},
  };

  if (readOnly) log.info('Environment', subdomain, 'Read-Only Mode');

  return {
    subdomain,
    auth,
    baseUrl,
    limiter,
    log,
    errors,
    logErrors,
    readOnly,
    output,
    proxy,
  };
}

exports.create = create;
