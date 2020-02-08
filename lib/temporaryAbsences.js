const common = require('./common');

/**
 * A module related to xMatters temporary absences.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#temporary-absences}
 *
 * @module temporaryAbsences
 */

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/temporary-absences', query, 'Temporary Absences');
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} temporaryAbsence
 */
async function create(env, temporaryAbsence) {
  return common.create(env, '/api/xm/1/temporary-absences', temporaryAbsence, 'Temporary Absence', true);
}

/**
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {*} temporaryAbsenceId
 */
async function _delete(env, temporaryAbsenceId) {
  await common.delete(env, '/api/xm/1/temporary-absences/', temporaryAbsenceId, 'Temporary Absence');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} temporaryAbsences
 */
async function exportToImport(destination, temporaryAbsences) {
  /*
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  const destinationSites = (destinationData.all ? destinationData.all.sites : null) || destinationData.sites;
  const { defaultSupervisorId } = options;
  */
  return temporaryAbsences.map(temporaryAbsence => {
    {
      delete temporaryAbsence.links;
      // if (temporaryAbsence.site && temporaryAbsence.site.name) {
      //  temporaryAbsence.site = destinationSites.find(({ name }) => temporaryAbsence.site.name === name).id;
      // }

      temporaryAbsence.member = temporaryAbsence.member.targetName;
      if (temporaryAbsence.group) temporaryAbsence.group = temporaryAbsence.member.targetName;

      return temporaryAbsence;
    }
  });
}

/**
 *
 */
const fields = [
  //'id',
  'start',
  'end',
  'member',
  'replacement',
  'absenceType'
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {*} sourceTemporaryAbsences
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.TemporaryAbsences
 * @param {Object} options
 */
async function sync(destination, sourceTemporaryAbsences, destinationTemporaryAbsences, options) {
  return common.syncObject(
    'Temporary Absence',
    sourceTemporaryAbsences,
    destinationTemporaryAbsences,
    destination,
    ['member', 'start', 'end', 'member', 'replacement', 'absenceType'],
    fields,
    create,
    undefined,
    _delete,
    options
  );
}

exports.getMany = getMany;
exports.create = create;
exports.delete = _delete;
exports.exportToImport = exportToImport;
exports.fields = fields;
exports.sync = sync;
