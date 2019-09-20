const rp = require('request-promise');

exports.getMany = getMany;
/**
 * Returns an array of device type as strings.
 *
 * https://help.xmatters.com/xmapi/index.html#device-types
 * @param {*} env
 */
async function getMany({ auth, limiter, baseUrl }) {
  let uri = `${baseUrl}/api/xm/1/device-types`;

  const options = { method: 'GET', uri, auth };
  const resBody = JSON.parse(await limiter.schedule(rp, options));
  return resBody.data;
}
