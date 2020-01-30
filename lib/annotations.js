const util = require('./util');

/**
 *
 * @param {*} env
 * @param {*} eventId event UUID
 * @param {string} annotationID annotation UUID
 */
async function get(env, annotationId, query, eventId) {
  return util.get(
    env,
    `/api/xm/1/events/${eventId}/annotations/`,
    annotationId,
    query,
    `Annotation`
  );
}

/**
 * https://help.xmatters.com/xmapi/index.html#get-event-annotations
 * @param {*} env
 * @param {string} eventId event UUID
 */
async function getMany(env, query, eventId) {
  return util.getMany(env, `/api/xm/1/events/${eventId}/annotations`, query, `Annotations`);
}

/**
 *
 * @param {Object} env xMatters environment (xm.environment.create())
 * @param {string} eventId event UUID to create annotation for
 * @param {Object} annotation
 *
 *  **Examples:**
 * - {comment: "Looking into the problem"}
 */
async function create(env, annotation, eventId) {
  return util.create(
    env,
    `/api/xm/1/events/${eventId}/annotations`,
    annotation,
    'Annotation',
    true
  );
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
