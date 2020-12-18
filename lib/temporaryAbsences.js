const common = require('./common');

/**
 * A module related to xMatters temporary absences.<br><br>
 * {@link https://help.xmatters.com/xmapi/index.html#temporary-absences}
 *
 * @module temporaryAbsences
 */

/**
 * Get all temporary absences from xMatters matching the query. Please refer to the link below for the available query parameters.<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#get-temporary-absences}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {Object} query A json object representing the query string parameters for this request.
 * @returns {Promise<TemporaryAbsence[]>} Array of Temporary Absence Objects Requested
 */
async function getMany(env, query) {
  return common.getMany(env, '/api/xm/1/temporary-absences', query, 'Temporary Absences');
}

/**
 * Create a temporary absence in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#create-a-temporary-absence}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} temporaryAbsence {@link https://help.xmatters.com/xmapi/index.html#temporary-absence-object}
 * @returns {Promise<TemporaryAbsence>} Temporary Absence Object Created
 */
async function create(env, temporaryAbsence) {
  return common.create(env, '/api/xm/1/temporary-absences', temporaryAbsence, 'Temporary Absence', true);
}

/**
 * Delete a temporary absence in xMatters<br><br>
 *
 * {@link https://help.xmatters.com/xmapi/index.html#delete-a-temporary-absence}
 *
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} temporaryAbsenceId The unique identifier (id) for the temporary absence.<br><br>
 * Examples:<br>
 * - b2341d69-8b83-4660-b8c8-f2e728f675f9<br>
 * @returns {Promise}
 * @name delete
 */
async function _delete(env, temporaryAbsenceId) {
  await common.delete(env, '/api/xm/1/temporary-absences/', temporaryAbsenceId, 'Temporary Absence');
}

/**
 * Transforms an array of records exported from xMatters to the format needed to import into xMatters.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {TemporaryAbsence[]} temporaryAbsences {@link https://help.xmatters.com/xmapi/index.html#temporary-absence-object}
 * @returns {Promise}
 */
async function exportToImport(destination, temporaryAbsences, destinationData) {
  const destinationPeople =
    (destinationData.all ? destinationData.all.people : null) || destinationData.people;
  const destinationGroups =
    (destinationData.all ? destinationData.all.groups : null) || destinationData.groups;
  /*
  const destinationSites = (destinationData.all ? destinationData.all.sites : null) || destinationData.sites;
  const { defaultSupervisorId } = options;
  */
  return common.convertDefaultInitial(temporaryAbsences, convert);

  function convert(temporaryAbsence) {
    {
      const { member, group, replacement } = temporaryAbsence;
      delete temporaryAbsence.links;
      // if (temporaryAbsence.site && temporaryAbsence.site.name) {
      //  temporaryAbsence.site = destinationSites.find(({ name }) => temporaryAbsence.site.name === name).id;
      // }

      if (group) {
        //support the xMatters get format and a just targetName, and finally default to uuid.
        let destinationGroup;

        destinationGroup = destinationGroups.find(
          destinationGroup =>
            group === destinationGroup.targetName ||
            (group.targetName && group.targetName === destinationGroup.targetName)
        );

        if (!destinationGroup) {
          destination.log.warn(
            `DATA INTEGRITY ISSUE: Group mapping failed. Temporary Absence [${JSON.stringify(
              temporaryAbsence
            )}] has a group [${group}] but this member was not found in the provided destination data. Assumed to be a UUID.`
          );
        } else {
          temporaryAbsence.group = destinationGroup.id;
        }
      }

      if (member) {
        //support the xMatters get format and a just targetName, and finally default to uuid.
        let destinationPerson;

        destinationPerson = destinationPeople.find(
          destinationPerson =>
            member === destinationPerson.targetName ||
            (member.targetName && member.targetName === destinationPerson.targetName)
        );

        if (!destinationPerson) {
          destination.log.warn(
            `DATA INTEGRITY ISSUE: Member mapping failed. Temporary Absence [${JSON.stringify(
              temporaryAbsence
            )}] has a member [${member}] but this member was not found in the provided destination data. Assumed to be a UUID.`
          );
        } else {
          temporaryAbsence.member = destinationPerson.id;
        }
      }

      if (replacement) {
        //support the xMatters get format and a just targetName, and finally default to uuid.
        let destinationPerson;

        destinationPerson = destinationPeople.find(
          destinationPerson =>
            replacement === destinationPerson.targetName ||
            (replacement.targetName && replacement.targetName === destinationPerson.targetName)
        );

        if (!destinationPerson) {
          destination.log.warn(
            `DATA INTEGRITY ISSUE: Replacement mapping failed. Temporary Absence [${JSON.stringify(
              temporaryAbsence
            )}] has a replacement [${replacement}] but this replacement was not found in the provided destination data. Assumed to be a UUID.`
          );
        } else {
          temporaryAbsence.replacement = destinationPerson.id;
        }
      }

      return temporaryAbsence;
    }
  }
}

/**
 * The key values from the object that can be synchronized.
 */
const fields = [
  //'id',
  'start',
  'end',
  'member',
  'replacement',
  'absenceType',
  'group',
];

/**
 * Synchronizes an array of objects from a source with destination objects and updates the destination as necessary.
 * @param {module:environments.xMattersEnvironment} destination The xmtoolbox representation of the target or destination xMatters instance.
 * @param {TemporaryAbsence} sourceTemporaryAbsences An array of the Temporary Absence objects to synchronize from the source data.
 * @param {TemporaryAbsence[]} destinationTemporaryAbsences An array of the Temporary Absence objects to synchronize from the destination data.
 * @param {Object} options
 */
async function sync(destination, sourceTemporaryAbsences, destinationTemporaryAbsences, options) {
  return common.syncObject(
    'Temporary Absence',
    sourceTemporaryAbsences,
    destinationTemporaryAbsences,
    destination,
    ['member', 'start', 'end', 'replacement', 'absenceType', 'group'],
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
