const util = require('./util');

exports.get = get;
/**
 *
 * @param {*} env
 * @param {*} eventId event UUID
 * @param {string} annotationID annotation UUID
 */
async function get(env, eventId, annotationID) {
  return util.get(
    env,
    `/api/xm/1/events/${eventId}/annotations/`,
    annotationID,
    query,
    `Annotation ${annotationID}`
  );
}

exports.getMany = getMany;
/**
 * https://help.xmatters.com/xmapi/index.html#get-event-annotations
 * @param {*} env
 * @param {string} eventId event UUID
 */
async function getMany(env, eventId) {
  return await util.getMany(
    env,
    `/api/xm/1/events/${eventId}/annotations`,
    null,
    `Annotations for ${eventId}`
  );
}

exports.create = create;
/**
 *
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {string} eventId event UUID to create annotation for
 * @param {Object} annotation
 *
 *  **Examples:**
 * - {comment: "Looking into the problem"}
 */
async function create(env, eventId, annotation) {
  return await util.create(
    env,
    `/api/xm/1/events/${eventId}/annotations`,
    annotation,
    `Annotation for ${eventId}`,
    true
  );
}
