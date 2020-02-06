const Bottleneck = require('bottleneck');
const log = require('loglevel');

/**
 * @module environments
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
 * @property {object} log - a logLevel log object.
 *
 * More information is available here: https://github.com/pimterry/loglevel
 * @property {[object]} errors - array of errors that are generated.
 * @property {function} logErrors - function to write out errors to the [console] log.
 *
 */

/**
 * @typedef EnvironmentOptions
 * @property {string} logLevel
 *
 * Set to one of:
 * 'trace', 'debug', 'info' ,warn', 'error', 'silent'
 */

/**
 *
 * Create a representation of an xMatters instance with credientials, url, connection
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
 * @param {EnvironmentOptions} options
 *
 *
 * @returns {xMattersEnvironment}
 */
function create(subdomain, user, pass, options = {}) {
  const limiter = new Bottleneck({
    maxConcurrent: 25
  });
  const auth = { user, pass };
  const baseUrl = `https://${subdomain}.xmatters.com`;

  const logLevel = options.logLevel || 'error';

  log.setLevel(logLevel);

  const errors = [];

  function logErrors() {
    errors.map(error => {
      log.error(error.message);
    });
  }

  return { subdomain, auth, baseUrl, limiter, log, errors, logErrors };
}

exports.create = create;
