const util = require('./util');

exports.get = get;
/**
 *
 * @param {*} env
 * @param {*} id event UUID
 * @param {*} query
 *
 * **Examples:**
 * - null: returns simple event object.
 * - {embed:'properties,recipients,annotations,messages,responseOptions'}
 * - {embed:'responseOptions,responseOptions.translations'}
 * - {embed:'recipients', targeted:'true'}
 * - {at:'2018-11-02T08:00:00.000Z'}
 */
async function get(env, id, query) {
  return util.get(env, '/api/xm/1/events/', id, query);
}

exports.getMany = getMany;
/**
 * get-events: review documentation for full query options: https://help.xmatters.com/xmapi/index.html#get-events
 *
 * **Examples:**
 * - {propertyName: 'customerAffected', propertyValue: 'false'}
 * - {status: 'ACTIVE,SUSPENDED'}
 * - {priority:'HIGH,MEDIUM,LOW'}
 * - {embed: 'properties,annotations,responseOptions'}
 * - {embed: 'responseOptions,responseOptions.translations'}
 * - {sortBy: 'START_TIME' sortOrder: 'ASCENDING'}
 * - {requestId: '5588db90-6b87-4662-9a2f-107d3bb233bf'}
 * - {plan: 'c56730a9-1435-4ae2-8c7e-b2539e635ac6,d0019da1-7cc3-432c-a97d-136515986980'}
 * - {plan: 'Database monitoring', form: '8824b5b3-5875-4f04-adbc-e60fb108bef6'}
 * - {submitterid: 'mmcbride'}
 * - {search: 'Database', fields:'name'}
 * - {eventType: 'SYSTEM,USER'}
 * - {from: '2017-05-01T14:00:00.000Z', to: '2017-05-01T19:00:00.000Z'}
 * - {propertyName:'animals,books', propertyValue:'dogs,fiction', propertyValueOperator:'EQUALS,CONTAINS'}
 * - {at: '2018-11-02T08:00:00.000Z', from:'2018-01-27T08:00:00.000Z', to: '2018-06-30T08:00:00.000Z'}
 * @param {*} env
 * @param {*} query
 */
async function getMany(env, query) {
  return await util.getMany(env, '/api/xm/1/events', query);
}

/**
 * Note: events.trigger() is an alias for events.create()
 */
exports.trigger = create;
exports.create = create;
/**
 * Trigger (or creates) and event in xMatters
 *
 * https://help.xmatters.com/xmapi/index.html#trigger-an-event
 *
 * @param {*} env
 * @param {*} endpoint
 *
 * **Examples:**
 * - 'api/integration/1/functions/ba601cb1-3513-4320-b48a-05cb501bb5af/triggers?apiKey=ffcd4dec-8a49-4a67-9e59-ed9fabcb002d'
 *
 * @param {*} event event object to generate the event.
 */
async function create(env, endpoint, event) {
  return await util.create(
    env,
    endpoint,
    event,
    `Event ${endpoint.split('?')[0]}`,
    true
  );
}

exports.update = update;
/**
 *
 * @param {*} env
 * @param {*} id
 * @param {*} event Only allowed propertye is 'status'. Must be one of:
 * - 'ACTIVE'
 * - 'SUSPENDED'
 * - 'TERMINATED'
 * **Examples:**
 * - {status: 'ACTIVE'}
 * - {status: 'SUSPENDED'}
 * - {status: 'TERMINATED'}
 *
 */
async function update(env, id, event) {
  return await util.update(env, '/api/xm/1/events', event, id, 'Event');
}
