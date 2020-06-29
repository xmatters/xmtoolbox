const common = require('./common');

/**
 * A module related to xMatters shifts.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#shifts}
 *
 * @module shifts
 */

/**
 * Get a shift from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-shift}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} shiftId The unique identifier (id) of the shift to update.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} groupId The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database<br>
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Shift>} Shift Object Requested
 */
async function get(env, shiftId, query, groupId) {
  return common.get(env, `/api/xm/1/groups/${groupId}/shifts/`, shiftId, query, `Shift`);
}

/**
 * Get all shifts in a group from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-shifts-in-a-group}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} groupId The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database<br>
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Shift[]>} Array of Shift Objects Requested
 */
async function getMany(env, query, groupId) {
  return common.getMany(env, `/api/xm/1/groups/${groupId}/shifts`, query, 'Shifts');
}

/**
 * Get all shift members in a shift from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-shifts-in-a-group}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} shiftId The unique identifier (id) or name of the of the shift.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - Morning
 * @param {string} groupId The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database<br>
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Shift>} Shift Object Requested
 */
async function getMembers(env, query, shiftId, groupId) {
  return common.getMany(env, `/api/xm/1/groups/${groupId}/shifts/${shiftId}/members`, query, 'Shift Members');
}

/**
 * Create a shift in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-shift}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Shift} shift {@link https://help.xmatters.com/xmapi/index.html#shift-object}
 * @param {string} groupId The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Shift>} Shift Object Created
 */
async function create(env, shift, groupId) {
  return common.create(env, `/api/xm/1/groups/${groupId}/shifts/`, shift, 'Shift', true);
}

/**
 * Update a shift in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-shift}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Shift} shift {@link https://help.xmatters.com/xmapi/index.html#shift-object}
 * @param {string} shiftId The unique identifier (id) of the shift to update.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {string} groupId The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Shift>} Shift Object Updated
 */
async function update(env, shift, shiftId, groupId) {
  return common.update(env, `/api/xm/1/groups/${groupId}/shifts/`, shift, shiftId, 'Shift');
}

/**
 * Delete a shift in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-shift}
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} shiftId The unique identifier (id) or name (name) of the shift to delete.<br><br>
 * Examples:<br>
 * - Morning
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {string} groupId   The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, shiftId, groupId) {
  await common.delete(env, `/api/xm/1/groups/${groupId}/shifts/`, shiftId, 'Shift');
}

/**
 * Add a member to a shift in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#add-a-member-to-a-shift}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {ShiftMember} member {@link https://help.xmatters.com/xmapi/index.html#shift-member-object}
 * @param {string} shiftId The unique identifier (id) or name (name) of the shift to delete.<br><br>
 * Examples:<br>
 * - Morning
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {string} groupId The unique identifier (id) or name (name) of the group that contains the shift.<br><br>
 * Examples:<br>
 * - Database
 * - a5341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<ShiftMember>} ShiftMember Object Created
 */
async function addMember(env, member, shiftId, groupId) {
  return common.create(
    env,
    `/api/xm/1/groups/${groupId}/shifts/${shiftId}/members`,
    member,
    `Add Member to Shift`
  );
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Shift[]} shifts {@link https://help.xmatters.com/xmapi/index.html#shift-object}
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, shifts, destinationData) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;

  const destinationGroups =
    (destinationData.all ? destinationData.all.groups : null) || destinationData.groups;

  const destinationDevices =
    (destinationData.all ? destinationData.all.devices : null) || destinationData.devices;

  return await shifts.map(shift => {
    {
      //set group
      const group = shift.group; //For reference
      //group can be supplied as a string representing the targetName of the group or an object with targetName key.
      if (shift.group) {
        if (shift.group.targetName) {
          shift.group = shift.group.targetName;
        }
        //attempt to find a matching group and use it's id
        if (destinationGroups) {
          const destinationGroup = destinationGroups.find(
            ({ targetName }) => targetName === (group.targetName || group)
          );
          if (destinationGroup && destinationGroup.id) shift.group = destinationGroup.id;
        }
      }

      if (shift.members && shift.members.data) {
        shift.members = shift.members.data;

        shift.members = shift.members
          .map(member => {
            let destinationMemberRecipient;

            if (member.recipient.recipientType === 'PERSON') {
              destinationMemberRecipient = destinationPeople.find(
                ({ targetName }) => targetName === member.recipient.targetName
              );
            } else if (member.recipient.recipientType === 'DEVICE') {
              destinationMemberRecipient = destinationDevices.find(
                ({ targetName }) => targetName === member.recipient.targetName
              );
            }

            //2020-Jan-27: "400: If specified, escalation type needs to be NONE when delay is specified to be 0"
            if (member.delay === 0) {
              member.escalationType = 'NONE';
            }

            if (!destinationMemberRecipient) {
              destination.log.error(
                new Error(
                  `DATA INTEGRITY ISSUE: Shift Member mapping failed. Group [${
                    group.targetName || group
                  }] has a Shift [${shift.name}] which has a member with targetName [${
                    member.recipient.targetName
                  }] but this member was not found in the provided destination data.`
                )
              );
              return null;
            } else if (member.recipient.recipientType === 'DEVICE') {
              member.recipient = member.recipient.targetName;
              return member;
            } else {
              delete member.shift;
              member.recipient = destinationMemberRecipient.id;
              return member;
            }
          })
          .filter(member => (member ? true : false));
      }

      //2020-April-10 Temp fix for API returining empty array of days. Should be treated as all days.
      if (
        shift.recurrence.onDays &&
        shift.recurrence.onDays.length === 0 &&
        shift.recurrence.frequency === 'WEEKLY'
      ) {
        shift.recurrence.onDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
      }

      delete shift.links;
      //delete shift.group;
      return shift;
    }
  });
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  //'id',
  //'group',
  //'links',
  'name',
  'start',
  'end',
  'rotationType',
  'rotation',
  'timezone',
  'recurrence',
  'members',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Shift[]} sourceShifts An array of the shift objects to synchronize from the source data.
 * @param {Shift[]} destinationShifts An array of the shift objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceShifts, destinationShifts, options) {
  return common.syncObject(
    'Shift',
    sourceShifts,
    destinationShifts,
    destination,
    ['name', 'group'],
    fields,
    create,
    update, //TODO: 2020-Jan-29: Need shift updates to be supported https://xmexternal.zendesk.com/agent/tickets/152353
    _delete,
    options,
    'group'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getMembers = getMembers;
exports.create = create;
exports.delete = _delete;
exports.addMember = addMember;
/*
exports.objects = {
  shift,
  recipientPointer,
  shiftMember,
  shiftRecurrence,
  end
};
*/
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
