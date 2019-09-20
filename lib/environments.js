const Bottleneck = require('bottleneck');
const log = require('loglevel');

exports.create = create;
/**
 * Creates
 * @param {*} subdomain the subdomain of the xMatters Environment. for example: "blah" if your url is https://blah.xmatters.com/...
 * @param {*} username
 * @param {*} password
 * @param {number} logging Global Log setting. setting multiple times uses the last setting
 *
 * set to one of:
 * - 'error': errors only
 * - 'info': include info
 * - 'trace'
 * - 'debug':incude info & debug,
 */
function create(subdomain, username, password, logLevel = 'error') {
  const limiter = new Bottleneck({
    maxConcurrent: 28 //10 safe, 30 max
  });
  const auth = { user: username, pass: password };
  const baseUrl = `https://${subdomain}.xmatters.com`;

  log.setLevel(logLevel);

  return { subdomain, username, password, auth, baseUrl, limiter, log };
}
