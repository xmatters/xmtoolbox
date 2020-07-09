/**
 * This module wraps many of the xMatters Rest API endpoints to simplify the interaction with the API.
 *
 * Documentation contained in this project contains content from https://help.xmatters.com to help describe the parameters that are used to ultimately call the xMatters xmapi.
 * @module index
 */

exports.annotations = require('./lib/annotations');
exports.audits = require('./lib/audits');
//exports.convert = require('./lib/convert');
exports.deviceNames = require('./lib/deviceNames');
exports.devices = require('./lib/devices');
exports.deviceTypes = require('./lib/deviceTypes');
exports.dictionary = require('./lib/dictionary');
exports.dynamicTeams = require('./lib/dynamicTeams');
exports.environments = require('./lib/environments');
exports.events = require('./lib/events');
exports.eventSuppressions = require('./lib/eventSuppressions');
exports.forms = require('./lib/forms');
exports.groupMembers = require('./lib/groupMembers');
exports.groups = require('./lib/groups');
exports.importJobs = require('./lib/importJobs');
exports.integrations = require('./lib/integrations');
exports.oauth = require('./lib/oauth');
exports.onCall = require('./lib/onCall');
exports.people = require('./lib/people');
exports.planConstants = require('./lib/planConstants');
exports.planEndpoints = require('./lib/planEndpoints');
exports.planProperties = require('./lib/planProperties');
exports.plans = require('./lib/plans');
exports.roles = require('./lib/roles');
exports.scenarios = require('./lib/scenarios');
exports.sharedLibraries = require('./lib/sharedLibraries');
exports.shifts = require('./lib/shifts');
exports.sites = require('./lib/sites');
exports.subscriptionForms = require('./lib/subscriptionForms');
exports.subscriptions = require('./lib/subscriptions');
exports.sync = require('./lib/sync');
exports.temporaryAbsences = require('./lib/temporaryAbsences');
exports.uploads = require('./lib/uploads');
exports.util = require('./lib/util');
exports.request = require('./lib/request');
