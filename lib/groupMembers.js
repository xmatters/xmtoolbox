const common = require('./common');
/**
 * A module related to xMatters group members/group roster.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#group-roster}
 *
 * @module groupMembers
 */

/**
 * Get all group members from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-the-group-roster}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} groupId The unique identifier (id) or name (targetName) of the group.
 * @returns {Promise<GroupMember[]>} Array of Group Member Objects Requested
 */
async function getMany(env, query, groupId) {
  return common.getMany(
    env,
    `/api/xm/1/groups/${encodeURIComponent(groupId)}/members`,
    query,
    'Group Members'
  );
}

/**
 * Add a group member to a group in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#add-a-member-to-the-group-roster}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} member
 * @param {*} groupId The unique identifier (id) or name (targetName) of the group.
 * Examples:<br>
 * - Oracle Administrators<br>
 * - bab4a72f-e118-462d-ad87-e38e28e822e0
 * @returns {Promise<GroupMember>} Group Member Object Created
 */
async function create(env, member, groupId) {
  return common.create(
    env,
    `/api/xm/1/groups/${encodeURIComponent(groupId)}/members/`,
    member,
    `Group Member`,
    false
  );
}

/**
 * Remove a group member from a group in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#remove-a-member-from-the-group-roster}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} memberId
 * @param {*} groupId The unique identifier (id) or name (targetName) of the group.
 * Examples:<br>
 * - IT<br>
 * - aeb08e86-2674-4812-9145-e157b0e24c16
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, memberId, groupId) {
  await common.delete(
    env,
    `/api/xm/1/groups/${encodeURIComponent(groupId)}/members/`,
    memberId,
    'Group Member'
  );
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {GroupMember[]} groupMembers Array of group members to transform.
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 */
async function exportToImport(destination, groupMembers, destinationData) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;

  const destinationGroups =
    (destinationData.all ? destinationData.all.groups : null) || destinationData.groups;
  return common.convertDefaultInitial(await groupMembers, convert);

  function convert(groupMember) {
    {
      //set group
      //group can be supplied as a string representing the targetName of the group or an object with targetName key.
      if (groupMember.group) {
          groupMember.group = groupMember.group.targetName || groupMember.group;

          //attempt to find a matching group and use it's id
          if (destinationGroups) {
            const destinationGroup = destinationGroups.find(
              ({ targetName }) => targetName === groupMember.group
            );
            if (destinationGroup && destinationGroup.id) groupMember.group = destinationGroup.id;
          }
      }

      //set group
      //group can be supplied as a string representing the targetName of the group or an object with targetName key.
      if (groupMember.member) {
        groupMember.id = groupMember.member; //support direct TargetName or id for member

        if (groupMember.member.targetName) {
          groupMember.id = groupMember.member.targetName;

          groupMember.recipientType = groupMember.member.recipientType;

          if (groupMember.recipientType === 'PERSON') {
            //attempt to find a matching person and use it's id
            if (destinationPeople) {
              const destinationPerson = destinationPeople.find(
                ({ targetName }) => targetName === (groupMember.member || groupMember.member.targetName)
              );
              if (destinationPerson && destinationPerson.id) groupMember.id = destinationPerson.id;
            }
          } else if (groupMember.recipientType === 'GROUP') {
            //attempt to find a matching group and use it's id
            if (destinationGroups) {
              const destinationGroup = destinationGroups.find(
                ({ targetName }) => targetName === (groupMember.member || groupMember.member.targetName)
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
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = ['id', 'recipientType'];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {GroupMember[]} sourceGroupMembers  An array of the group member objects to synchronize from the source data.
 * @param {GroupMember[]} destinationGroupMembers An array of the group member objects to synchronize from the destination data.
 * @param {Object} options
 * @param {string} groupId The UUID of the group to sync the group members to.
 * @returns {Promise<module:sync.SyncResults>}
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
