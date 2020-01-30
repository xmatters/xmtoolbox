const util = require('./util');
//https://help.xmatters.com/xmapi/index.html#temporary-absences

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} query
 */
async function getMany(env, query) {
  return util.getMany(env, '/api/xm/1/temporary-absences', query, 'Temporary Absences');
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} temporaryAbsence
 */
async function create(env, temporaryAbsence) {
  return util.create(env, '/api/xm/1/temporary-absences', temporaryAbsence, 'Temporary Absence', true);
}

/**
 *
 * @param {*} env The xmtoolbox representation of an xMatters instance.
 * @param {*} temporaryAbsenceId
 */
async function _delete(env, temporaryAbsenceId) {
  await util.delete(env, '/api/xm/1/temporary-absences/', temporaryAbsenceId, 'Temporary Absence');
}

/**
 *
 * @param {*} destination
 * @param {*} temporaryAbsences
 * @param {*} destinationData
 * @param {*} options
 */
async function exportToImport(destination, temporaryAbsences, destinationData, options) {
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
 *
 * @param {*} destination
 * @param {*} sourceTemporaryAbsences
 * @param {*} destinationTemporaryAbsences
 * @param {*} options
 */
async function sync(destination, sourceTemporaryAbsences, destinationTemporaryAbsences, options) {
  return util.syncObject(
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
