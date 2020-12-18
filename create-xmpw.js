#!/usr/bin/env node
const readline = require('readline');
const xm = require('./index');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let keyName = '';
let success = false;

rl.question('What is your xMatters subdomain? ', function (subdomain) {
  keyName = `XM_KEY_${subdomain.toUpperCase().replace(/\-/g, '_')}`;
  rl.question('What is your xMatters password? ', function (password) {
    rl.question('Please provide a 32 character encryption key ', function (key) {
      subdomain = subdomain.toLowerCase();
      const passFilePath = `${subdomain}.xmp`;
      xm.util.EncryptToFile(passFilePath, password, key);

      if (subdomain && password && key) success = true;

      rl.close();
    });
  });
});

rl.on('close', function () {
  if (success) {
    console.log(
      'To automatically have xmtoolbox decrypt your password and use it, provide your key as your password or ' +
        'set your key in the environment variable: ' +
        keyName
    );
    process.exit(0);
  }

  console.log('Failure');
  process.exit(0);
});
