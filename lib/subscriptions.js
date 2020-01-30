const util = require('./util');

async function get(env, subscriptionId, query) {
  return util.get(env, '/api/xm/1/subscriptions/', subscriptionId, query, 'Subscription');
}

async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/subscriptions', query, 'Subscriptions');
}

async function getSubscribers(env, query, subscriptionId) {
  return util.getMany(
    env,
    `/api/xm/1/subscriptions/${subscriptionId}/subscribers`,
    query,
    'Subscription Subscribers'
  );
}

async function create(env, subscription) {
  return util.create(env, '/api/xm/1/subscriptions', subscription, 'Subscription', true);
}

async function update(env, subscription, subscriptionId) {
  return util.update(
    env,
    '/api/xm/1/subscriptions/',
    subscription,
    subscriptionId,
    'Subscription'
  );
}

async function _delete(env, subscriptionId) {
  return util.delete(env, '/api/xm/1/subscriptions/', subscriptionId, 'Subscription');
}

async function deleteSubscriber(env, subscriberId, subscriptionId) {
  await util.delete(
    env,
    `/api/xm/1/subscriptions/${subscriptionId}/subscribers/`,
    subscriberId,
    'Subscription Subscribers'
  );
}

const fields = [
  //'id',
  'name',
  'description',
  'plan',
  'scope',
  //'created',
  'oneWay',
  'subscribeOthers',
  'notificationDelay',
  'showNotificationDelay',
  'propertyDefinitions',
  'roles',
  'targetDeviceNames',
  'visibleTargetDeviceNames'
];

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
exports.fields = fields;
