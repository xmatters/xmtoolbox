const util = require('./util');

async function get(env, subscriptionFormId, query) {
  return util.get(
    env,
    '/api/xm/1/subscription-forms/',
    subscriptionFormId,
    query,
    'Subscription Form'
  );
}

async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/subscription-forms', query, 'Subscription Forms');
}

async function getManyInPlan(env, query, planId) {
  return util.getMany(
    env,
    `/api/xm/1/plans/${planId}/subscription-forms`,
    query,
    'Subscription Forms In Plan'
  );
}

exports.get = get;
exports.getMany = getMany;
exports.getManyInPlan = getManyInPlan;
