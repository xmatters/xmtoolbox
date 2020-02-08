const common = require('./common');

/**
 * A module related to xMatters subscriptions.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#subscriptions}
 *
 * @module subscriptions
 */

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionId
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function get(env, subscriptionId, query) {
  return common.get(env, '/api/xm/1/subscriptions/', subscriptionId, query, 'Subscription');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscriptions', query, 'Subscriptions');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {*} subscriptionId
 */
async function getSubscribers(env, query, subscriptionId) {
  return common.getMany(
    env,
    `/api/xm/1/subscriptions/${subscriptionId}/subscribers`,
    query,
    'Subscription Subscribers'
  );
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscription
 */
async function create(env, subscription) {
  return common.create(env, '/api/xm/1/subscriptions', subscription, 'Subscription', true);
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscription
 * @param {*} subscriptionId
 */
async function update(env, subscription, subscriptionId) {
  return common.update(env, '/api/xm/1/subscriptions/', subscription, subscriptionId, 'Subscription');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionId
 */
async function _delete(env, subscriptionId) {
  return common.delete(env, '/api/xm/1/subscriptions/', subscriptionId, 'Subscription');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriberId
 * @param {*} subscriptionId
 */
async function deleteSubscriber(env, subscriberId, subscriptionId) {
  await common.delete(
    env,
    `/api/xm/1/subscriptions/${subscriptionId}/subscribers/`,
    subscriberId,
    'Subscription Subscribers'
  );
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} subscriptions
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 */
async function exportToImport(destination, subscriptions, destinationData) {
  const destinationSubscriptionForms =
    (destinationData.all ? destinationData.all.subscriptionForms : null) || destinationData.subscriptionForms;
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return await subscriptions.map(subscription => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      subscription.form = {
        id: common.AssignParentObject(subscription.form, destinationSubscriptionForms, 'name')
      };

      if (subscription.recipients && subscription.recipients.data) {
        subscription.recipients = subscription.recipients.data.map(recipient => ({
          id: common.AssignParentObject(recipient, destinationPeople, 'targetName')
        }));
      }

      if (subscription.owner) {
        subscription.owner = {
          id: common.AssignParentObject(subscription.owner, destinationPeople, 'targetName')
        };
      }

      if (subscription.criteria && subscription.criteria.data) {
        subscription.criteria = subscription.criteria.data;
      }
      if (subscription.targetDeviceNames && subscription.targetDeviceNames.data) {
        subscription.targetDeviceNames = subscription.targetDeviceNames.data;
      }

      delete subscription.links;
      delete subscription.created;

      return subscription;
    }
  });
}

/**
 *
 */
const fields = [
  //'id',
  'name',
  'description',
  'owner',
  'notificationDelay',
  'criteria',
  'recipients',
  'targetAllDevices',
  'targetDeviceNames'
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} sourceSubscriptions
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.Subscriptions
 * @param {*} options
 */
async function sync(destination, sourceSubscriptions, destinationSubscriptions, options) {
  return common.syncObject(
    'Subscription',
    sourceSubscriptions,
    destinationSubscriptions,
    destination,
    ['name', 'form'],
    fields,
    create,
    update,
    undefined,
    options,
    'form'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getSubscribers = getSubscribers;
exports.create = create;
exports.update = update;
exports.delete = _delete;
exports.deleteSubscriber = deleteSubscriber;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
