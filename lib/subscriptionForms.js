const common = require('./common');

/**
 * A module related to xMatters subscription forms.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#subscription-forms}
 *
 * @module subscriptionForms
 */

/**
 * Get a subscription form from xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-a-subscription-form}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} subscriptionFormId The unique identifier (id) of the subscription form.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {SubscriptionForm} Subscription Form Object Requested
 */
async function get(env, subscriptionFormId, query) {
  return common.get(env, '/api/xm/1/subscription-forms/', subscriptionFormId, query, 'Subscription Form');
}

/**
 * Get all subscription forms from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscription-forms}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<SubscriptionForm[]>} Array of Subscription Form Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/subscription-forms', query, 'Subscription Forms');
}

/**
 * Get all subscription forms in a communication plan from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-subscription-forms-in-a-plan}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @param {string} planId The unique identifier (id) or name of the communication plan.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * - MIM
 * @returns {Promise<SubscriptionForm[]>} Array of Subscription Form Objects Requested
 */
async function getManyInPlan(env, query, planId) {
  return common.getMany(
    env,
    `/api/xm/1/plans/${planId}/subscription-forms`,
    query,
    'Subscription Forms In Plan'
  );
}

/**
 * Create a subscription form in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-subscription-form}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {SubscriptionForm} subscriptionForm {@link https://help.xmatters.com/xmapi/index.html#subscription-form-objects}
 * @param {*} planId The UUID of the communication plan that is associated with the integration.
 * @returns {Promise<Site>} Site Object Created
 */
async function create(env, subscriptionForm, planId) {
  return common.create(
    env,
    `/api/xm/1/plans/${planId}/subscription-forms`,
    subscriptionForm,
    'Subscription Form',
    true
  );
}

/**
 * Update an subscription form in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#modify-a-subscription-form}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} integration {@link https://help.xmatters.com/xmapi/index.html#subscription-form-objects}
 * @param {*} subscriptionFormId The unique identifier (id) of the subscription form you want to modify.<br><br>
 * Examples:<br>
 * - 345c95ee-4abe-47ea-ae7c-ae84fb4bee4f<br>
 * @param {*} planId The UUID of the communication plan that is associated with the integration.
 * @returns {Promise<Integration>} Integration Object Updated
 */
async function update(env, subscriptionForm, subscriptionFormId, planId) {
  return common.update(
    env,
    `/api/xm/1/plans/${planId}/subscription-forms/`,
    subscriptionForm,
    subscriptionFormId,
    'Subscription Form'
  );
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {SubscriptionForm[]} subscriptionForms Array of subscription form objects to transform.
 * @returns {Promise}
 */
async function exportToImport(destination, subscriptionForms, destinationData) {
  const destinationPlans = (destinationData.all ? destinationData.all.plans : null) || destinationData.plans;
  const destinationForms = (destinationData.all ? destinationData.all.forms : null) || destinationData.forms;
  return common.convertDefaultInitial(subscriptionForms, convert);

  function convert(subscriptionForm) {
    {
      //if plan, set plan
      if (subscriptionForm.plan) {
        //plan can be supplied as a string representing the name of the plan or an object with name key.
        const planName = subscriptionForm.plan.name;
        subscriptionForm.plan = common.AssignParentObject(subscriptionForm.plan, destinationPlans, 'name');

        //if the planName was returned rather than the id.
        if (planName === subscriptionForm.plan) {
          destination.log.warn(
            `DATA INTEGRITY ISSUE: Subscription Plan [${subscriptionForm.name}] has plan [${planName}] but a plan with that name was not found in the provided destination data.`
          );
        }
      }

      //if form, set form
      if (subscriptionForm.form) {
        //form can be supplied as a string representing the name of the form or an object with name key.
        const formName = subscriptionForm.form.name;
        const id = common.AssignParentObject(subscriptionForm.form, destinationForms, 'name', ['plan']);
        subscriptionForm.form = { id };

        //if the formName was returned rather than the id.
        if (formName === subscriptionForm.form) {
          destination.log.warn(
            `DATA INTEGRITY ISSUE: Subscription Form [${subscriptionForm.name}] has form [${formName}] but a form with that name was not found in the provided destination data.`
          );
        }
      }

      if (subscriptionForm.roles && subscriptionForm.roles.data) {
        subscriptionForm.roles = subscriptionForm.roles.data.map(({ name }) => ({ name }));
      }

      if (subscriptionForm.propertyDefinitions && subscriptionForm.propertyDefinitions.data) {
        subscriptionForm.propertyDefinitions = subscriptionForm.propertyDefinitions.data.map(({ name }) => ({
          name,
        }));
      }

      if (subscriptionForm.notificationDelay) {
        subscriptionForm.notificationDelay = Number(subscriptionForm.notificationDelay);
      }

      if (subscriptionForm.targetDeviceNames) {
        subscriptionForm.targetDeviceNames = subscriptionForm.targetDeviceNames.data.map(
          ({ name, visible, selected }) => ({ name, visible, selected })
        );
      }

      {
        return subscriptionForm;
      }
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
  'devicesSectionCollapsed',
  'devicesSectionVisible',
  'notificationDelay',
  'propertyDefinitions',
  'oneWay',
  'roles',
  'scope',
  'form',
  'subscribeOthers',
  'targetDeviceNames',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {SubscriptionForm[]} sourceSubscriptionForms An array of the  subscription form objects to synchronize from the source data.
 * @param {SubscriptionForm[]} destinationSubscriptionForm An array of the subscription form objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceSubscriptionForms, destinationSubscriptionForms, options) {
  return common.syncObject(
    'Subscription Form',
    sourceSubscriptionForms,
    destinationSubscriptionForms,
    destination,
    'name',
    fields,
    create,
    update,
    undefined,
    options,
    'plan'
  );
}

module.exports = {
  get,
  getMany,
  getManyInPlan,
  create,
  update,
  exportToImport,
  fields,
  sync,
};
