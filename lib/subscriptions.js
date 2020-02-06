const common = require('./common');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionId
 * @param {*} query
 */
async function get(env, subscriptionId, query) {
  return common.get(env, '/api/xm/1/subscriptions/', subscriptionId, query, 'Subscription');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscriptions', query, 'Subscriptions');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
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
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscription
 */
async function create(env, subscription) {
  return common.create(env, '/api/xm/1/subscriptions', subscription, 'Subscription', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscription
 * @param {*} subscriptionId
 */
async function update(env, subscription, subscriptionId) {
  return common.update(env, '/api/xm/1/subscriptions/', subscription, subscriptionId, 'Subscription');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} subscriptionId
 */
async function _delete(env, subscriptionId) {
  return common.delete(env, '/api/xm/1/subscriptions/', subscriptionId, 'Subscription');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
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

async function exportToImport(destination, subscriptions, destinationData) {
  const destinationForms = (destinationData.all ? destinationData.all.forms : null) || destinationData.forms;
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  return await subscriptions.map(subscription => {
    {
      //set plan
      //plan can be supplied as a string representing the name of the plan or an object with name key.
      subscription.form = common.AssignParentObject(subscription.form, destinationForms, 'name');

      if (subscription.permitted && subscription.permitted.data) {
        subscription.permitted = subscription.permitted.data.map(
          ({ permissibleType, person, editor, role }) => {
            if (permissibleType === 'PERSON') {
              const destinationPerson = common.AssignParentObject(person, destinationPeople, 'targetName');
              return { permissibleType, person: destinationPerson, editor };
            } else if (permissibleType === 'ROLE') {
              return { permissibleType, role, editor };
            }
          }
        );
      }

      if (subscription.propertyDefinitions && subscription.propertyDefinitions.data) {
        subscription.propertyDefinitions = subscription.propertyDefinitions.data;
      }

      if (subscription.roles && subscription.roles.data) {
        subscription.roles = subscription.roles.data;
      }
      if (subscription.targetDeviceNames && subscription.targetDeviceNames.data) {
        subscription.targetDeviceNames = subscription.targetDeviceNames.data;
      }
      if (subscription.visibleTargetDeviceNames && subscription.visibleTargetDeviceNames.data) {
        subscription.visibleTargetDeviceNames = subscription.visibleTargetDeviceNames.data;
      }

      delete subscription.plan;
      delete subscription.scope;
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

/*
  {
    "id": "fb53b7a2-a1c6-42f0-96c2-018990bd77d5",
    "name": "test",
    "description": "",
    "plan": {
        "id": "f4517cbf-f00c-4bbf-ba6e-4d1375b4dbb0",
        "name": "Test Plan"
    },
    "scope": "ALL_FORMS",
    "created": "2018-03-13T13:36:22.139Z",
    "oneWay": false,
    "subscribeOthers": false,
    "notificationDelay": 0,
    "showNotificationDelay": true,
    "propertyDefinitions": {
        "count": 0,
        "total": 0,
        "data": []
    },
    "roles": {
        "count": 0,
        "total": 0,
        "data": []
    },
    "targetDeviceNames": {
        "count": 0,
        "total": 0,
        "data": []
    },
    "visibleTargetDeviceNames": {
        "count": 0,
        "total": 0,
        "data": []
    },
    "links": {
        "self": "/api/xm/1/subscription-forms/fb53b7a2-a1c6-42f0-96c2-018990bd77d5"
    }
}
*/

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
