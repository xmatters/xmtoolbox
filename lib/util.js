const fs = require('fs').promises;

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
  const data = await fs.readFile(path, 'utf8');
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

  //parse text and look for encoded commas.
  for (let character of text) {
    if (character === '"') {
      if (toggle && character === p) row[i] += character;
      toggle = !toggle;
    } else if (character === ',' && toggle) character = row[++i] = '';
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

  headers.filter(function(header) {
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

exports.CsvToJsonFromFile = CsvToJsonFromFile;
exports.CsvToJsonFromData = CsvToJson;
