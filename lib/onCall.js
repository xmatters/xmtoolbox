const common = require('./common');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 *
 * **Examples**
 * - {groups: 'group1,group2'}
 * - {groups: '18d30051-81d1-42bf-9dd8-9093ba7d9fac'}
 * - {groups: 'IT', from: '2019-04-14T04:00:00Z', to: '2019-04-16T04:00:00Z'}
 * - {groups: 'IT', embed: 'shift,members.owner'}
 * - {groups: 'IT', membersPerShift: '100'}
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/on-call/', query, 'On Call');
}

exports.getMany = getMany;
