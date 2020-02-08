const common = require('./common');

/**
 * A module related to xMatters events.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#events}
 *
 * @module events
 */

/**
 * Get a event from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-an-event}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} eventId The unique identifier or id of the event.<br><br>
 * Examples:<br>
 * - “24abd4c0-bff3-4381-9f84-678580b24428”<br>
 * - “408005”<br><br>
 *
 * Note: We recommend using the UUID, since the event ID number might not always return results. To find the id or UUID for an event, use GET /events or locate the Event UUID entry on the event’s Properties screen in the web interface.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Event>} Event Object Requested
 */
async function get(env, eventId, query) {
  return common.get(env, '/api/xm/1/events/', eventId, query, 'Event');
}

/**
 * Get all events from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-events}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Event[]>} Array of Event Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/events', query, 'Events');
}

/**
 * Get all user delivery data for an event in xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-user-delivery-data}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} eventId The unique identifier or id of the event.<br><br>
 * Examples:<br>
 * - “24abd4c0-bff3-4381-9f84-678580b24428”<br>
 * - “408005”
 * @returns {Promise<UserDeliveryData[]>} Array of User Delivery Data Objects Requested
 */
async function getManyUserDeliveries(env, query, eventId) {
  return common.getMany(env, `/api/xm/1/events/${eventId}/user-deliveries`, query, 'Event User Delivervies');
}

/***
 * Note: events.trigger() is an alias for events.create()
 */

/**
 * Create an event in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#trigger-an-event}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Event} event {@link https://help.xmatters.com/xmapi/index.html#event-object}
 * @param {string} functionId The id of the function. This may be found Integration or Flow Designer URL.
 * @returns {Promise<Event>} Event Object Created
 */
async function create(env, event, functionId) {
  return common.create(env, `/api/integration/1/functions/${functionId}/triggers`, event, 'Event', true);
}

/**
 * Update an event [status] in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#change-the-status-of-an-event}
 *
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Event} event {@link https://help.xmatters.com/xmapi/index.html#event-object}
 * @param {string} eventId The unique identifier or id of the event.<br><br>
 * Examples:<br>
 * - “24abd4c0-bff3-4381-9f84-678580b24428”<br>
 * - “408005”<br><br>
 *
 * Note: We recommend using the UUID, since the event ID number might not always return results. To find the id or UUID for an event, use GET /events or locate the Event UUID entry on the event’s Properties screen in the web interface.
 * @returns {Promise<Event>} Event Object Updated
 */
async function update(env, event, eventId) {
  return common.update(env, '/api/xm/1/events', event, eventId, 'Event');
}

exports.get = get;
exports.getMany = getMany;
exports.getManyUserDeliveries = getManyUserDeliveries;
exports.trigger = create;
exports.create = create;
exports.update = update;
