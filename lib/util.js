const fs = require('fs');
const crypto = require('crypto');
const common = require('./common');

/**
 * A module containing helpful utilities to ease the use of xmtoolbox.<br><br>
 *
 * @module util
 */

/**
 * @typedef module:util.CSVTOJSON_OPTIONS
 * @type {Object}
 * @property {number}  headerRow Default: 0
 *
 * The line index where the header starts.
 * @property  {number}  dataStartRow Default: 1
 *
 * The line index where the data starts.
 *
 * @property {string[]}  headers default: undefined
 *
 * If no header row is included, include an array of string names for the columns.
 * Included a name for all columns from left  most column to right most needed column.
 * If headers are not included it may be desired to set the dataStartRow option to start at index 0.
 */

/**
 * Takes a path to a CSV file and returns a JSON object representing the file.
 * Included to prevent the need for additional packages in most cases.
 * If this doesn't work for you implement your own or use some of the other packages available.
 * @param {string} path path to to CSV file.
 * @param {module:util.CSVTOJSON_OPTIONS} options options object to allow some flexibility when converting CSV files to JSON.
 * @returns {Object} JSON Object representation of the CSV data
 */
async function CsvToJsonFromFile(path, options) {
  const data = await fs.promises.readFile(path, 'utf8');
  return CsvToJson(data, options);
}

/**
 * Takes a string of data in CSV format and returns a JSON object representing the data.
 * Included to prevent the need for additional packages in most cases.
 * If this doesn't work for you implement your own or use some of the other packages available.
 * @param {string} data the CSV data.
 * @param {module:util.CSVTOJSON_OPTIONS} options options object to allow some flexibility when converting CSV files to JSON.
 * @returns {Object} JSON Object representation of the CSV data
 */
function CsvToJson(text, options = {}) {
  let p = '';
  let row = [''];
  let lines = [row];
  let i = 0;
  let r = 0;
  let toggle = true;
  const delimiter = options.delimiter || ',';

  //parse text and look for encoded commas.
  for (let character of text) {
    if (character === '"') {
      if (toggle && character === p) row[i] += character;
      toggle = !toggle;
    } else if (character === delimiter && toggle) character = row[++i] = '';
    else if (character === '\n' && toggle) {
      if (p === '\r') row[i] = row[i].slice(0, -1);
      row = lines[++r] = [(character = '')];
      i = 0;
    } else row[i] += character;
    p = character;
  }

  const headerRow = options.headerRow || 0;
  const dataStartRow = options.dataStartRow || 1;
  //trim header names.
  let headers = options.headers || lines[headerRow];

  headers = headers.map(colName => colName.trim());

  headers.filter(function (header) {
    return header != null && header !== '';
  });

  return lines.slice(dataStartRow).map(line => {
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = line[i];
    }
    return row;
  });
}

function JsonToCsv(data, options = {}) {
  // https://tools.ietf.org/html/rfc4180
  // https://www.loc.gov/preservation/digital/formats/fdd/fdd000323.shtml
  let columns;
  if (options.columns) {
    columns = options.columns;
  } else {
    columns = new Set();

    data.map(row => {
      Object.keys(row).forEach(column => columns.add(column));
    });
  }

  columns = Array.from(columns);

  const delimiter = options.delimiter || ',';

  //add rows
  let rows = data.map(d => {
    return columns.map(column => (d[column] ? ParseCSV(d[column]) : '')).join(delimiter);
  });

  //add headers
  const headers = columns.map(column => ParseCSV(column));
  rows.unshift(headers);

  return rows.join('\r\n');
}

//turn a string to a csv safe string
function ParseCSV(value) {
  let text = value.toString();

  text = text.replace(/"/g, '""');

  if (text.indexOf('"') > -1 || text.indexOf(',') > -1) return '"' + text + '"';

  return text;
}

/**
 * POST request to xMatters Instance. Useful for sending data to a Workflow Flow.<br><br>
 *
 * Abides by the concurrency limit for the instance.<br><br>
 *
 * WARNING: The environment's readOnly option is not enforced when using this function.
 * @param {module:environments.xMattersEnvironment} env The xmtoolbox representation of an xMatters instance.
 * @param {string} api The api endpoint past the base URL. Example: '/api/xm/1/groups' or 'https://SUBDOMAIN.xmatters.com'
 * @param {Object} json The object to include in the request body as json
 * @param {Object} query A json object representing the query string parameters for this request.
 */
async function post(env, api, json, query) {
  return common.request(env, api, query, { json, method: 'POST' }, 'Custom Request');
}

const EncryptToFile = (path, text, key, options) => {
  const encrypted = Encrypt(text, key, options);
  fs.writeFileSync(path, JSON.stringify(encrypted));
};

const DecryptFromFile = (path, key, options) => {
  const encrypted = JSON.parse(fs.readFileSync(path, 'utf8'));
  return Decrypt(encrypted, key, options);
};

const Encrypt = (text, key, options = {}) => {
  if (key.length < 32) throw Error('The key must be at least 32 characters.');

  const algorithm = options.algorithm || 'aes-256-gcm';
  const bytes = options.bytes || 16;
  const iv = crypto.randomBytes(bytes);
  const cipher = crypto.createCipheriv(algorithm, key.substring(0, 32), iv);
  const data = Buffer.concat([cipher.update(text), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encrypted = {
    iv: iv.toString('hex'),
    data: data.toString('hex'),
    tag: tag.toString('hex'),
  };

  return encrypted;
};

const Decrypt = (encrypted, key, options = {}) => {
  if (key.length < 32) throw Error('The key must be at least 32 characters.');
  const algorithm = options.algorithm || 'aes-256-gcm';
  const { iv, data, tag } = encrypted;

  const decipher = crypto.createDecipheriv(algorithm, key.substring(0, 32), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = Buffer.concat([decipher.update(data, 'hex'), decipher.final()]);
  return decrypted.toString();
};

const pick = common.pick;

const find = common.find;

const isEqual = common.isEqual;

const isMatch = common.isMatch;

const defaults = common.defaults;

const defaultsDeep = common.defaultsDeep;

module.exports = {
  CsvToJsonFromFile,
  CsvToJsonFromData: CsvToJson,
  CsvToJson,
  JsonToCsv,
  post,
  Encrypt,
  Decrypt,
  EncryptToFile,
  DecryptFromFile,
  pick,
  find,
  isEqual,
  isMatch,
  defaults,
  defaultsDeep,
};
