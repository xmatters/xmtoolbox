const common = require('./common');

/**
 * A module related to xMatters event annotations (comments).<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#get-event-annotations}
 *
 * @module annotations
 */

/**
 * Get an event annotation from an event in xMatters<br><br>
 * 
 * {@link https://help.xmatters.com/xmapi/index.html#get-an-event-annotation}
 * 
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance
 * @param {string} annotationId The unique identifier (id) or eventID (eventId) of the event
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} eventId The unique identifier (id) or eventID (eventId) of the event.<br><br>
 * Examples :<br>
 * - “add6a38f-bed7-4169-afa2-cbaf5387ef06”<br>
 * - “41159032”<br><br>
 *
 * Note: We recommend using the UUID, since the event ID number might not always return results. To find the id or UUID for an event, use events.getMany() or locate the Event UUID entry on the event’s Properties screen in the user interface.
 @returns {Promise<Annotation>} Annotation Object Requested
 @module annotations
 */
async function get(env, annotationId, query, eventId) {
  return common.get(
    env,
    `/api/xm/1/events/${encodeURIComponent(eventId)}/annotations/`,
    annotationId,
    query,
    `Annotation`
  );
}

/**
 * Get all event annotations from a xMatters event matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-event-annotations}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} eventId The unique identifier (id) or eventID (eventId) of the event.<br><br>
 * Examples :<br>
 * - “add6a38f-bed7-4169-afa2-cbaf5387ef06”<br>
 * - “41159032”<br><br>
 *
 * Note: We recommend using the UUID, since the event ID number might not always return results. To find the id or UUID for an event, use events.getMany() or locate the Event UUID entry on the event’s Properties screen in the user interface.
 * @returns {Promise<Annotation[]>} Array of Annotation Objects Requested
 * @module annotations
 */
async function getMany(env, query, eventId) {
  return common.getMany(
    env,
    `/api/xm/1/events/${encodeURIComponent(eventId)}/annotations`,
    query,
    `Annotations`
  );
}

/**
 * Create an event annotation in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#add-a-comment-to-an-event}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Annotation} annotation {@link https://help.xmatters.com/xmapi/index.html#event-annotation-object}
 * @param {string} eventId The unique identifier (id) or eventID (eventId) of the event.<br><br>
 * Examples :<br>
 * - “add6a38f-bed7-4169-afa2-cbaf5387ef06”<br>
 * - “41159032”<br><br>
 *
 * Note: We recommend using the UUID, since the event ID number might not always return results. To find the id or UUID for an event, use events.getMany() or locate the Event UUID entry on the event’s Properties screen in the user interface.
 * @returns {Promise<Annotation>} Annotation Object Created
 * @module annotations
 */
async function create(env, annotation, eventId) {
  return common.create(
    env,
    `/api/xm/1/events/${encodeURIComponent(eventId)}/annotations`,
    annotation,
    'Annotation',
    true
  );
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
