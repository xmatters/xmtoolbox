const Bottleneck = require('bottleneck');

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
 * @property {string} logLevel The level of logging to output for this environment.
 *
 * Default 'error'<br><br>
 * Set to one of:<br>
 * - 'silent': No console logging<br>
 * - 'error': Only Errors<br>
 * - 'warn': Errors and warnings.<br>
 * - 'info': Errors, warnings, and information.<br>
 * - 'debug': All console messages.<br>
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
 * @param {string} user - xMatters username with REST Web Service User Role
 * @param {string} pass - Password for user with REST Web Service User Role
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
    maxConcurrent: 10 || process.env.MAX_CONCURRENT_CONNECTIONS
  });
  const auth = { user, pass };
  const baseUrl = `https://${subdomain}.xmatters.com`;

  const logLevel = options.logLevel || 'error';
  const errors = [];

  function logErrors() {
    errors.map(error => {
      log.error(error.message);
    });
  }

  const logLevels = ['silent', 'error', 'warn', 'info', 'debug'];
  let logIndex = logLevels.indexOf(logLevel.toLowerCase());

  if (typeof logIndex !== 'number') logIndex = 1;

  const log = {
    error: logIndex >= 1 ? console.error : () => {},
    warn: logIndex >= 2 ? console.warn : () => {},
    info: logIndex >= 3 ? console.info : () => {},
    log: logIndex >= 4 ? console.log : () => {}
  };

  return { subdomain, auth, baseUrl, limiter, log, errors, logErrors };
}

exports.create = create;
