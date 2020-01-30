const util = require('./util');

/**
 * https://help.xmatters.com/xmapi/index.html#get-the-group-roster
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {string} groupId targetName or UUID for the group
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {*} query
 *
 * **Examples:**
 * - { embed: 'shifts' }
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} groupId
 */
async function getMany(env, query, groupId) {
  return util.getMany(env, `/api/xm/1/groups/${groupId}`, query, 'Group Members');
}

/**
 * https://help.xmatters.com/xmapi/index.html#add-a-member-to-the-group-roster
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {string} groupId targetName or UUID for the group
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {obj} member
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} member
 * @param {*} groupId
 */
async function create(env, member, groupId) {
  return util.create(env, `/api/xm/1/groups/${groupId}/members/`, member, `Group Member`, true);
}

/**
 * https://help.xmatters.com/xmapi/index.html#remove-a-member-from-the-group-roster
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group. Strings will be URL Encoded.
 * **Examples:**
 * - 'Oracle Administrators'
 * - 'bab4a72f-e118-462d-ad87-e38e28e822e0'
 *
 * @param {string} memberId The unique identifier (id) for the member to be removed.
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} memberId
 * @param {*} groupId
 */
async function _delete(env, memberId, groupId) {
  await util.delete(env, `/api/xm/1/groups/${groupId}/members/${memberId}`, id, 'Group Member');
}

exports.getMany = getMany;
exports.create = create;
exports.delete = _delete;
