const common = require('./common');

/**
 * A module related to xMatters subscriptions.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#subscriptions}
 *
 * @module subscriptions
 */

/**
 * Get a subscription from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-subscription}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} subscriptionId The unique identifier (id) or name of the subscription.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - High Security Events
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Subscription} Subscription Object Requested
 */
async function get(env, subscriptionId, query) {
  return common.get(env, '/api/xm/1/subscriptions/', subscriptionId, query, 'Subscription');
}

/**
 * Get all subscriptions from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscriptions}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<Subscription[]>} Array of Subscription Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscriptions', query, 'Subscriptions');
}

/**
 * Get all people in a subscription from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscribers}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} subscriptionId The unique identifier (id) for the subscription.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Person[]>} Array of Person Objects Requested
 */
async function getSubscribers(env, query, subscriptionId) {
  return common.getMany(
    env,
    `/api/xm/1/subscriptions/${encodeURIComponent(subscriptionId)}/subscribers`,
    query,
    'Subscription Subscribers'
  );
}

/**
 * Create a subscription in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-subscription}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Subscription} subscription {@link https://help.xmatters.com/xmapi/index.html#subscription-object}
 * @returns {Promise<Subscription>} Subscription Object Created
 */
async function create(env, subscription) {
  return common.create(env, '/api/xm/1/subscriptions', subscription, 'Subscription', true);
}

/**
 * Update a subscription in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-subscription}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Subscription} subscription {@link https://help.xmatters.com/xmapi/index.html#subscription-object}
 * @param {string} subscriptionId The unique identifier (id) for the subscription.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise<Subscription>} Subscription Object Updated
 */
async function update(env, subscription, subscriptionId) {
  return common.update(env, '/api/xm/1/subscriptions/', subscription, subscriptionId, 'Subscription');
}

/**
 * Delete a subscription in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-subscription}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} subscriptionId The unique identifier (id) for the subscription.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, subscriptionId) {
  return common.delete(env, '/api/xm/1/subscriptions/', subscriptionId, 'Subscription');
}

/**
 * Remove a subscriber from a subscription in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#unsubscribe-a-user}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} subscriberId  The unique identifier (id) for the person to remove from the subscription<br><br>
 * Examples:<br>
 * - a1341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {string} subscriptionId The unique identifier (id) for the subscription.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 */
async function deleteSubscriber(env, subscriberId, subscriptionId) {
  await common.delete(
    env,
    `/api/xm/1/subscriptions/${encodeURIComponent(subscriptionId)}/subscribers/`,
    subscriberId,
    'Subscription Subscribers'
  );
}

/**
 * Get a subscription's share permissions from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscription-share-permissions}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} subscriptionId The unique identifier (id) or name of the subscription to get .<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - Major Incident Subscription
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Subscription} Subscription Share Permissions Object Requested
 */
async function getSubscriptionSharePermissions(env, subscriptionId) {
  return common.getMany(env, `/api/xm/1/subscriptions/${subscriptionId}/share-permissions`, subscriptionId, 'Subscription Share Permissions');
}


/**
 * Sets a subscriptions share permissions<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#set-subscription-share-permissions}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {subscriptionId} subscriptionId {@link https://help.xmatters.com/xmapi/index.html#subscription-object}
 * @param {subscriptionSharePermissions} subscriptionSharePermissions {@link https://help.xmatters.com/xmapi/index.html#set-subscription-share-permissions}
 * @returns {Promise<Subscription>} Subscription Share Permissions Object Created
 */
async function setSubscriptionSharePermissions(env, subscriptionId, subscriptionSharePermissions) {
  return common.create(env, `/api/xm/1/subscriptions/${encodeURIComponent(subscriptionId)}/share-permissions`, subscriptionSharePermissions, 'Subscription Share Permissions', true);
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Subscription} subscriptions {@link https://help.xmatters.com/xmapi/index.html#subscription-object}
 * @param {xMattersObjects} destinationData The xMatters data for the destination.
 * @returns {Promise}
 */
async function exportToImport(destination, subscriptions, destinationData) {
  const destinationSubscriptionForms =
    (destinationData.all ? destinationData.all.subscriptionForms : null) || destinationData.subscriptionForms;
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return common.convertDefaultInitial(await subscriptions, convert);

  function convert(subscription) {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      subscription.form = {
        id: common.AssignParentObject(subscription.form, destinationSubscriptionForms, 'name'),
      };

      if (subscription.recipients && subscription.recipients.data) {
        subscription.recipients = subscription.recipients.data.map(recipient => ({
          id: common.AssignParentObject(recipient, destinationPeople, 'targetName'),
        }));
      }

      if (subscription.owner) {
        subscription.owner = {
          id: common.AssignParentObject(subscription.owner, destinationPeople, 'targetName'),
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
  }
}

/**
 * The key values from the object that can be synchronized.
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
  'targetDeviceNames',
  'form'
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {Subscription[]} sourceSubscriptions An array of the subscription objects to synchronize from the source data.
 * @param {Subscription[]} destinationSubscriptions An array of the subscription objects to synchronize from the destination data.
 * @param {Object} options
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
exports.getSubscriptionSharePermissions = getSubscriptionSharePermissions;
exports.setSubscriptionSharePermissions = setSubscriptionSharePermissions;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
