const util = require('./util');

exports.get = get;
/**
 * Returns a Group object that contains a representation of the group.
 *
 * https://help.xmatters.com/xmapi/index.html#get-a-group
 * @param {*} env
 * @param {string} id The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {string} query A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 * Example: 2017-05-01T19:00:00.000Z
 */
async function get(env, id, query = { embed: 'supervisors,observers' }) {
  return util.get(env, '/api/xm/1/groups/', id, query);
}

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-groups
 * @param {*} env
 * @param {*} query
 */
async function getMany(env, query = { embed: 'observers' }) {
  return await util.getMany(env, '/api/xm/1/groups', query);
}

exports.create = create;
/**
 * https://help.xmatters.com/xmapi/index.html#create-a-group
 * @param {*} env
 * @param {*} group
 */
async function create(env, group) {
  return await util.create(
    env,
    '/api/xm/1/groups',
    group,
    `Group ${group.targetName}`,
    true
  );
}

exports.update = update;
/**
 * https://help.xmatters.com/xmapi/index.html#modify-a-group
 * @param {*} env
 * @param {string} id The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {*} group
 */
async function update(env, id, group) {
  return await util.update(env, '/api/xm/1/groups/', group, id, 'Group');
}

exports.delete = _delete;
/**
 * https://help.xmatters.com/xmapi/index.html#delete-a-group
 * @param {*} env
 * @param {string} id The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 */
async function _delete(env, id) {
  await util.delete(env, '/api/xm/1/groups/', id, 'Group');
}
