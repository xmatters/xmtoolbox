const common = require('./common');

/**
 * Returns responses to an event and any comments added, depending on the query parameters entered.
 *
 * Note that the response object is a separate object from the comment (annotation) on the response. For example, if two responses were selected and three comments added to an event, adding both the EVENT_ANNOTATED and RESPONSE_RECEIVED query parameters returns 5 objects.
 *
 * https://help.xmatters.com/xmapi/index.html#audit-types
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {object} query
 *
 * **Examples:**
 *  - { "eventId":“408005”, auditType: "EVENT_ANNOTATED,RESPONSE_RECEIVED"}
 *  - {at: '2018-11-02T08:00:00.000Z', from:'2018-01-27T08:00:00.000Z', to:'2018-06-30T08:00:00.000Z'}
 *  - {eventId: '24abd4c0-bff3-4381-9f84-678580b24428', sortOrder: 'ascending'}
 *
 * **Default:** undefined
 *
 * **--Options--**
 *
 * **eventId** Optional: The unique identifier or event ID of the event that you want to retrieve comments for.
 *
 * We recommend using the UUID, since the event ID number might not always return results. To find the id or UUID for an event, use GET /events or locate the Event UUID entry on the event’s Properties screen in the user interface.
 *
 * **auditType** Optional:A comma-separated list of the type of audit events to retrieve.
 *  - EVENT_ANNOTATED: retrieves event comments (annotations)
 *  - RESPONSE_RECEIVED: retrieves the response option a recipient selected when responding to a notification, as well as any comments added when responding using the mobile app.
 *
 * **sortOrder** Optional: Sets whether audits are sorted in ascending or descending order by their creation timestamp. Valid values include:
 *  - ASCENDING
 *  - DESCENDING
 *
 *  Default: ASCENDING
 *
 * **at** Optional: A date and time in UTC format. Using the at query parameter tells the request to search historical data. Must be used with the to and from, or after and before parameters.
 *
 * **to** Optional: A date in UTC format that represents the end of the time range you want to search. All objects created at or before the specified time range are displayed in the query results. Example: 2017-05-01T19:00:00.000Z brings back any events initiated at or prior to 7 pm, May 1, 2017.
 *
 *  When setting the to parameter, the time cannot be further in the future than the time of the at parameter. For example, if the at parameter is set for 2018-12-01T13:00:00.000Z (1:00 pm, December 1st), the to parameter cannot be set for 2018-12-01T14:30:00.000Z (2:30 pm, December 1st).
 *
 * **from** Optional: A date in UTC format that represents the start of the time range you want to search. All objects created at or after the specified time range are displayed in the query results. Example: 2017-05-01T14:00:00.000Z brings back any events initiated at or past 2 pm on May 1st, 2017.
 *
 *  Access to data using the from parameter is limited by your pricing plan. For example, if your pricing plan allows you access to 90 days of historical data, you will receive an error message if you set the from parameter to be greater than 90 days in the past.
 *
 * **after** Optional:before: A time in UTC format, used in place of to, that represents the end of the time range you want to search. Only objects created before the specified time range are displayed in the query results.
 *
 *  To allow for unknown factors such as clock drift and network lag, there is a 15-minute synchronization window between data collected by the current system and historical data. This means that when searching historical data, the “to” or “before” parameters cannot be within 15 minutes of the current time.
 *
 * **before** Optional:A time in UTC format, used in place of from, that represents the start of the time range you want to search. Only objects created after the specified time range are displayed in the query results.
 *
 */

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/audits', query, 'Audits');
}

exports.getMany = getMany;
