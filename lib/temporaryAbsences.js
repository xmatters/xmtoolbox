const util = require('./util');
//https://help.xmatters.com/xmapi/index.html#temporary-absences

exports.get = get;
async function get(env, query) {
  return util.get(env, '/api/xm/1/temporary-absences', null, query);
}

exports.create = create;
async function create(env, temporaryAbsence) {
  return await util.create(
    env,
    '/api/xm/1/temporary-absences',
    temporaryAbsence,
    `Temporary Absence ${temporaryAbsence.member} ${temporaryAbsence.absenceType} ${temporaryAbsence.replacement} ${temporaryAbsence.group}`,
    true
  );
}

exports.delete = _delete;
async function _delete(env, id) {
  await util.delete(
    env,
    '/api/xm/1/temporary-absences/',
    id,
    'Temporary Absence'
  );
}
