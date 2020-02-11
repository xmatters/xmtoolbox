const common = require('./common');

/**
 * A module related to xMatters shifts.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#roles}
 *
 * @module roles
 */

/**
 * Get all roles from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-roles}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Shift[]>} Array of Shift Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, `/api/xm/1/roles`, query, 'Roles');
}

exports.getMany = getMany;
