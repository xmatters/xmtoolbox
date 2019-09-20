const rp = require('request-promise');

// library for interacting with xMatters that handles concurrency
// and other lower level data processing.
exports.get = get;
/**
 * Returns a Shift object object that represents a shift in xMatters.
 *
 * https://help.xmatters.com/xmapi/index.html#shifts
 * @param {obj} env
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group whose shift list you want.
 *
 * Example:IT
 *
 * Example:2633ba0e-4e2a-44a4-91f8-9133da60692b
 * @param {string} shiftId The unique identifier (id) or name (targetName) of the shift.
 *
 * Example:24x7
 *
 * Example:8a63013a-870c-4f02-8afc-c174a235318d
 * @param {string} at A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 * Example: 2017-05-01T19:00:00.000Z
 */
async function get(env, groupId, shiftId, at) {
  const uri = `${env.baseUrl}/api/xm/1/groups/${encodeURI(
    groupId
  )}/shifts/${encodeURI(shiftId)}?embed=members`;
  if (at) uri += `&at=${at}`;
  const options = { method: 'GET', uri, auth: env.auth };
  const resBody = await env.limiter.schedule(rp, options);

  return JSON.parse(resBody);
}

exports.getMany = getMany;
/**
 * Returns a Shift object object that represents a shift in xMatters.
 *
 * https://help.xmatters.com/xmapi/index.html#shifts
 * @param {obj} env
 * @param {string} groupId The unique identifier (id) or name (targetName) of the group whose shift list you want.
 *
 * Example:IT
 *
 * Example:2633ba0e-4e2a-44a4-91f8-9133da60692b
 * @param {string} at A date and time in UTC format that represents the time in the past at which you want to view the state of the data in the system. Using the at query parameter tells the request to search historical data.
 *
 * Example: 2017-05-01T19:00:00.000Z
 */
async function getMany(env, groupId, at) {
  const uri = `${env.baseUrl}/api/xm/1/groups/${encodeURI(
    groupId
  )}/shifts?embed=members`;
  if (at) uri += `&at=${at}`;
  const options = { method: 'GET', uri, auth: env.auth };
  const resBody = await env.limiter.schedule(rp, options);

  return JSON.parse(resBody);
}

exports.create = create;
/**
 *
 * @param {obj} env xMatters Environment
 * @param {string} groupId Required: The unique identifier (id) or name (targetName) of the group whose shift list you want.
 * @param {*} name
 * @param {*} recurrence
 * @param {Object_Shift} shiftObject Required: Object_Shift representation of a shift.
 */
async function create(env, groupId, shiftObject) {
  const uri = `${env.baseUrl}/api/xm/1/groups/${encodeURI(groupId)}/shifts/`;
  const json = shiftObject;
  const options = { method: 'POST', uri, auth: env.auth, json };
  const resBody = await env.limiter.schedule(rp, options);

  return resBody;
}

exports.addMember = addMember;
/**
 * Returns a Shift object object that represents a shift in xMatters.
 *
 * NOTE: Requests are processed asynchronously. Use position if you want a predictable order in your shift.
 *
 * https://help.xmatters.com/xmapi/index.html#shifts
 * @param {obj} env xMatters Environment
 * @param {string} groupId Required: The unique identifier (id) or name (targetName) of the group whose shift list you want.
 *
 * Example:IT
 *
 * Example:2633ba0e-4e2a-44a4-91f8-9133da60692b
 * @param {string} shiftId Required: The unique identifier (id) or name (targetName) of the shift.
 *
 * Example:24x7
 *
 * Example:8a63013a-870c-4f02-8afc-c174a235318d
 * @param {obj} member Required: An object representing the shift member. Only recipient is required.
 *
 * { "position": 6,
 * "delay": 15,
 * "escalationType": "Peer",
 * "inRotation": true,
 * "recipient":
 * {  //RecipientPointer Object
 * "id": "ceb08e86-2674-4812-9145-d157b0e24c17",
 *  "recipientType": "PERSON"
 * }
 */
async function addMember(env, groupId, shiftId, member) {
  const uri = `${env.baseUrl}/api/xm/1/groups/${encodeURI(
    groupId
  )}/shifts/${shiftId}/members`;
  const options = { method: 'POST', uri, auth: env.auth, json: member };
  const resBody = await env.limiter.schedule(rp, options);

  return resBody;
}

/**
 * You must give the shift a name; if you don’t specify any other parameters, this creates a “Default Shift” that is active 24x7. You can also give your shift a description and include other parameters, such as a start and end time, to create a more complex shift. If you want to configure a recurring shift, there are other parameters specific to the different recurrence types and frequency; see the remaining tables in this section for the appropriate fields.
 * @param {*} name Required: The name of the shift. The name can contain a maximum of 100 characters.
 * @param {*} description Optional: A description of the shift. The description can contain a maximum of 200 characters.
 * @param {*} start Optional: A time in UTC that defines the start of the first shift occurrence.
 * @param {*} end Optional: A time in UTC that defines the end of the first shift occurrence.
 * @param {*} recurrence Optional: Sets the recurrence of the shift (when and how often it is active).
 * @param {*} members Optional: A list of members in the shift.
 */
const shift = function shift(
  name,
  description = undefined,
  start = undefined,
  end = undefined,
  recurrence = undefined,
  members = undefined
) {
  const obj = { name };
  if (description) obj.description = description;
  if (start) obj.start = start;
  if (end) obj.end = end;
  if (recurrence) obj.recurrence = recurrence;
  if (members) obj.members = members;
  return obj;
};

/**
 * Known as the RecipientPointer object in the xMatters documentation,
 * This object is used as the "recipient" of a shift.
 *
 * https://help.xmatters.com/xmapi/index.html#recipient-pointer-object
 * @param {string} id Required: UUID or target name of user, group, or device.
 * @param {string} recipientType Optional: If set, must be one of the options below.
 *
 * “PERSON”
 *
 * “GROUP”
 *
 * “DEVICE”
 * @param {string} shiftId The unique identifier (id) or name (targetName) of the shift.
 */
function recipientPointer(id, recipientType) {
  const obj = { id };
  if (recipientType) obj.recipientType = recipientType.toUpperCase();
  return obj;
}

/**
 * Known as the RecipientPointer object in the xMatters documentation,
 * This object is used as the "recipient" of a shift.
 *
 * https://help.xmatters.com/xmapi/index.html#recipient-pointer-object
 * @param {Object_ReceipientPointer} receipient Required: Object_ReceipientPointer for the member of the shift.
 * @param {integer} position Optional: The position of the recipient in the shift. The value 1 represents the first member of the shift. If this value is not specified (or is larger than the total number of shift members) the member is added to the end of the shift.
 * @param {integer} delay Optional: The number of minutes to wait before escalating a notification to this member. Using a non-zero value for the delay causes xMatters to create an escalation before the shift member. Use the escalationType field to specify the category of this escalation.
 * @param {string} escalationType Optional: The category of the escalation that precedes the shift member. Use one of the following values:
 *
 * “None”
 *
 * “Peer”
 *
 * “Management”
 *
 * If you specify an escalation type other than None you must also specify an escalation delay. You cannot specify an escalationType value other than None for the first shift member.
 * @param {boolean} inRotation Optional: This value is true if the member rotates according to the shift’s rotation rules and false if the member stays in the same position for each notification. If omitted, this value defaults to true.
 */
function shiftMember(recipient, position, delay, escalationType, inRotation) {
  const obj = { recipient };
  if (position) obj.position = position;
  if (delay) obj.delay = delay;
  if (escalationType) obj.escalationType = escalationType;
  if (inRotation) obj.inRotation = inRotation;
  return obj;
}

/**
 * The shift recurrence defines when and how often a shift is active
 * @param {string} frequency The detailed parameters vary depending on the value of the shift frequency. Valid values include:
 * 
 * “ONCE” - no other parameters required.
 * 
 * “DAILY” - requires repeatEvery and end.
 * 
 * “WEEKLY” - requires repeatEvery, onDays, and end.
 * 
 * “EVERY_WEEKDAY” - requires end
 * 
 * “EVERY_WEEKEND_DAY” - requires end
 * 
 * “MONTHLY” - requires on, months, and end
 * 
 * “DATE_OF_MONTH” - requires dateOfMonth
 * 
 * “DAY_OF_WEEK” - requires dayOfWeekClassifier, and dayOfWeek
 * 
 * “YEARLY” - requires end
 * 
 * “HOLIDAY” - Holiday shifts are active only on site holidays; they are not active on other days. The duration of the holiday shift is determined by the start and end times. For HOLIDAY shifts, the group must have a site to use for holidays and this site must have holidays configured.
 * @param {string} repeatEvery Number of days between repetitions.
 * 
 * Required when frequency is: DAILY, WEEKLY
 * @param {array[string]} onDays Valid values include any combination of:
 * 
 * “SU”
 * 
 * “MO”
 * 
 * “TU”
 * 
 * “WE”
 * 
 * “TH”
 * 
 * “FR”
 * 
 * “SA”
 * 
 * Required when frequency is: WEEKLY
 * @param {string} on Valid values include: DATE_OF_MONTH, DAY_OF_WEEK
See dateOfMonth and dayOfWeek for additional information.

Required when frequency is: MONTHS
 * @param {array[string]} months Valid values include any combination of:
 * 
 * “JAN”
 * 
 * “FEB”
 * 
 * “MAR”
 * 
 * “APR
 * 
 * "MAY”
 * 
 * “JUN”
 * 
 * “JUL”
 * 
 * “AUG”
 * 
 * “SEP”
 * 
 * “OCT”
 * 
 * “NOV”
 * 
 * “DEC”
 * 
 * The following parameters are available to use with months:
 * 
 * dateOfMonth
 * 
 * dayOfWeekClassifier
 * 
 * dayOfWeek
 * 
 * Required when frequency is: MONTHLY
 * @param {string} dateOfMonth Defines a specific date of a month that a monthly shift occurs on. Valid values include: “1”, “2”, “3”…“31”, and “LAST” 
 * 
 * Required when frequency is: MONTHLY
 * @param {string} dayOfWeekClassifier Specifies if a monthly shift occurs on a relative day each month. Used with dayOfWeek.For example, for a shift that occurs on the last Friday of the month, dayOfWeekClassifier is set to LAST and dayOfWeek to FR.
 * 
 * Valid values include:
 * 
 * “FIRST”
 * 
 * “SECOND”
 * 
 * “THIRD”
 * 
 * “FOURTH”
 * 
 * “LAST”
 * 
 * Required when frequency is: MONTHLY
 * @param {string} dayOfWeek 	Used with dayOfWeekClassifier to define which day of the week the shift occurs. 
 * 
 * Valid values include:
 * 
 * “SU”
 * 
 * “MO”
 * 
 * “TU”
 * 
 * “WE”
 * 
 * “TH”
 * 
 * “FR”
 * 
 * “SA”
 * 
 * Required when frequency is: MONTHLY
 * @param {Object_End} end Object_End: The date and time in UTC format when a shift ends, or the number of repetitions that must occur before a shift ends. 
 * 
 * Required when frequency is: DAILY, WEEKLY, EVERY_WEEKDAY, EVERY_WEEKEND_DAY, MONTHLY, YEARLY
 */
function shiftRecurrence(
  frequency,
  repeatEvery,
  onDays,
  on,
  months,
  dateOfMonth,
  dayOfWeekClassifier,
  dayOfWeek,
  end
) {
  const obj = { frequency };
  if (repeatEvery) obj.repeatEvery = repeatEvery;
  if (onDays) obj.onDays = onDays;
  if (on) obj.on = on;
  if (months) obj.months = months;
  if (dateOfMonth) obj.dateOfMonth = dateOfMonth;
  if (dayOfWeekClassifier) obj.dayOfWeekClassifier = dayOfWeekClassifier;
  if (dayOfWeek) obj.dayOfWeek = dayOfWeek;
  if (end) obj.end = end;
  return obj;
}

/**
 * These values define when a shift recurrence ends. If the shift never ends, no additional information is required. If the shift ends on a specific date, or after a number of repetitions, those values must be added to the request.
 * @param {*} endBy The parameter used to set when a shift recurrence ends. Valid values include: NEVER, DATE, and REPETITIONS.
 * @param {*} date UTC date and time to end the recurrence. Used only when endBy is DATE.
 * @param {*} repetitions Number of times the shift occurs. Used only when endBy is REPETITIONS.
 */
function end(endBy, date, repetitions) {
  const obj = { endBy };
  if (date) obj.date = date;
  if (repetitions) obj.repetitions = repetitions;
  return obj;
}

exports.objects = {
  shift,
  recipientPointer,
  shiftMember,
  shiftRecurrence,
  end
};
