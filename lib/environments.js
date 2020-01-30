const Bottleneck = require('bottleneck');
const log = require('loglevel');

/**
 * Creates
 * @param {*} subdomain the subdomain of the xMatters Environment. for example: "blah" if your url is https://blah.xmatters.com/...
 * @param {*} username
 * @param {*} password
 * @param {object} options
 *
 * Options:
 *
 * logLevel: Global Log setting
 *
 * set to one of:
 * - 'error': errors only
 * - 'info': include info
 * - 'trace'
 * - 'debug':include info & debug,
 */
function create(subdomain, username, password, options = {}) {
  const limiter = new Bottleneck({
    maxConcurrent: 25 //10 safe, 30 max
  });
  const auth = { user: username, pass: password };
  const baseUrl = `https://${subdomain}.xmatters.com`;

  const logLevel = options.logLevel || 'error';

  log.setLevel(logLevel);

  const errors = [];
  return { subdomain, username, password, auth, baseUrl, limiter, log, errors };
}

exports.create = create;
