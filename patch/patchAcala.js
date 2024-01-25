const fs = require('fs');

const sourcePath0 = __dirname + '/storage.js';
const destinationPath0 = __dirname + '/../node_modules/@acala-network/sdk/utils/storage/storage.js';

const sourcePath = __dirname + '/../node_modules/@acala-network/eth-providers/lib/consts.js';
const destinationDir = __dirname + '/../node_modules/@acala-network/eth-providers/lib/lib';
const destinationPath = destinationDir + '/consts.js';

const updateFiles = [
  '/../node_modules/@acala-network/sdk/node_modules/@acala-network/sdk/wallet/web3name/did.js',
  '/../node_modules/@acala-network/sdk/wallet/we3name/did.js',
]

for (const file of updateFiles) {
  let data = fs.readFileSync(__dirname + file, 'utf8')
  data = data.replace(/wss:\/\/spiritnet.kilt.io\//g, 'wss://spiritnet.api.onfinality.io/public-ws')
  fs.writeFileSync(__dirname + file, data, 'utf8')
}

if (!fs.existsSync(destinationDir))
  fs.mkdirSync(destinationDir);

// Copy the file
fs.copyFile(sourcePath, destinationPath, (err) => {
  if (err) {
    console.error('An error occurred while copying the file:', err);
  } else {
    console.log('File copied successfully!');
  }
})
// Copy the file
fs.copyFile(sourcePath0, destinationPath0, (err) => {
  if (err) {
    console.error('An error occurred while copying the file:', err);
  } else {
    console.log('File copied successfully!0');
  }
})
