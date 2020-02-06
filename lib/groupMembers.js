const common = require('./common');

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
  return common.getMany(env, `/api/xm/1/groups/${groupId}/members`, query, 'Group Members');
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
  return common.create(env, `/api/xm/1/groups/${groupId}/members/`, member, `Group Member`, false);
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
  await common.delete(env, `/api/xm/1/groups/${groupId}/members/`, memberId, 'Group Member');
}

/**
 *
 * @param {*} destination
 * @param {*} groupMembers
 * @param {*} destinationData
 */
async function exportToImport(destination, groupMembers, destinationData) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;

  const destinationGroups =
    (destinationData.all ? destinationData.all.groups : null) || destinationData.groups;
  return await groupMembers.map(groupMember => {
    {
      //set group
      //group can be supplied as a string representing the targetName of the group or an object with targetName key.
      if (groupMember.group) {
        if (groupMember.group.targetName) {
          groupMember.group = groupMember.group.targetName;

          //attempt to find a matching group and use it's id
          if (destinationGroups) {
            const destinationGroup = destinationGroups.find(
              ({ targetName }) => targetName === groupMember.group
            );
            if (destinationGroup && destinationGroup.id) groupMember.group = destinationGroup.id;
          }
        }
      }

      //set group
      //group can be supplied as a string representing the targetName of the group or an object with targetName key.
      if (groupMember.member) {
        if (groupMember.member.targetName) {
          groupMember.id = groupMember.member.targetName;

          groupMember.recipientType = groupMember.member.recipientType;

          if (groupMember.recipientType === 'PERSON') {
            //attempt to find a matching person and use it's id
            if (destinationPeople) {
              const destinationPerson = destinationPeople.find(
                ({ targetName }) => targetName === groupMember.member || groupMember.member.targetName
              );
              if (destinationPerson && destinationPerson.id) groupMember.id = destinationPerson.id;
            }
          } else if (groupMember.recipientType === 'GROUP') {
            //attempt to find a matching group and use it's id
            if (destinationGroups) {
              const destinationGroup = destinationGroups.find(
                ({ targetName }) => targetName === groupMember.member || groupMember.member.targetName
              );
              if (destinationGroup && destinationGroup.id) groupMember.id = destinationGroup.id;
            }
          }
        }
      }

      delete groupMember.links;
      delete groupMember.shifts;
      delete groupMember.member;

      return groupMember;
    }
  });
}

const fields = ['id', 'recipientType'];

/**
 *
 * @param {*} destination
 * @param {*} sourceGroupMembers
 * @param {*} destinationGroupMembers
 * @param {*} options
 * @param {*} groupId
 */
async function sync(destination, sourceGroupMembers, destinationGroupMembers, options) {
  return common.syncObject(
    'Group Members',
    sourceGroupMembers,
    destinationGroupMembers,
    destination,
    ['id', 'group'],
    fields,
    create,
    undefined,
    _delete,
    options,
    'group'
  );
}

exports.getMany = getMany;
exports.create = create;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
