const util = require('./util');

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenarioId
 * @param {*} query
 */
async function get(env, scenarioId, query) {
  return util.get(env, '/api/xm/1/scenarios/', scenarioId, query, 'Scenario');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 * @param {*} formId
 * @param {*} planId
 */
async function getMany(env, query, formId, planId) {
  return util.getMany(env, `/api/xm/1/plans/${planId}/forms/${formId}/scenarios`, query, 'Scenarios');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario
 * @param {*} formId
 */
async function create(env, scenario, formId) {
  return util.create(env, `/api/xm/1/forms/${formId}/scenarios`, scenario, 'Scenario', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} scenario
 * @param {*} scenarioId
 * @param {*} formId
 */
async function update(env, scenario, scenarioId, formId) {
  return util.update(env, `/api/xm/1/forms/${formId}/scenarios/`, scenario, scenarioId, 'Scenario');
}

exports.get = get;
exports.getMany = getMany;
exports.create = create;
exports.update = update;

/*
 {
            "id": "fa5e0aea-a8e7-4970-ac0e-004a06b4905a",
            "name": "test scenario",
            "description": "",
            "plan": {
                "id": "f4517cbf-f00c-4bbf-ba6e-4d1375b4dbb0",
                "name": "Test Plan"
            },
            "form": {
                "id": "a3272808-8761-4a1b-aed5-40fca2a79d94",
                "name": "Test Form"
            },
            "position": 0,
            "bypassPhoneIntro": false,
            "escalationOverride": false,
            "overrideDeviceRestrictions": false,
            "requirePhonePassword": false,
            "voicemailOptions": {
                "retry": 0,
                "every": 0
            },
            "created": "2020-01-28T15:12:26.504Z",
            "permitted": {
                "count": 1,
                "total": 1,
                "data": [
                    {
                        "permissibleType": "PERSON",
                        "person": {
                            "id": "dc8d1ee3-bdf7-4d6c-a084-310da54688fd",
                            "targetName": "bvann",
                            "firstName": "Brannon",
                            "lastName": "Vann",
                            "recipientType": "PERSON",
                            "links": {
                                "self": "/api/xm/1/people/dc8d1ee3-bdf7-4d6c-a084-310da54688fd"
                            }
                        },
                        "editor": true
                    }
                ]
            },
            "recipients": {
                "count": 1,
                "total": 1,
                "data": [
                    {
                        "id": "dc8d1ee3-bdf7-4d6c-a084-310da54688fd",
                        "targetName": "bvann",
                        "recipientType": "PERSON",
                        "externallyOwned": false,
                        "links": {
                            "self": "/api/xm/1/people/dc8d1ee3-bdf7-4d6c-a084-310da54688fd"
                        },
                        "firstName": "Brannon",
                        "lastName": "Vann",
                        "language": "en",
                        "timezone": "US/Eastern",
                        "webLogin": "bvann",
                        "site": {
                            "id": "c82971d6-bbf2-4e5a-a74d-48af7d7ca05b",
                            "name": "Default Site",
                            "links": {
                                "self": "/api/xm/1/sites/c82971d6-bbf2-4e5a-a74d-48af7d7ca05b"
                            }
                        },
                        "lastLogin": "2020-01-28T15:07:50.091Z",
                        "targeted": true,
                        "status": "ACTIVE"
                    }
                ]
            },
            "links": {
                "self": "/api/xm/1/scenarios/fa5e0aea-a8e7-4970-ac0e-004a06b4905a"
            }
        }
         */
