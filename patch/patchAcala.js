const fs = require('fs');

// const sourcePath = __dirname + '/storage.js';
// const destinationPath = __dirname + '/../node_modules/@acala-network/sdk/utils/storage/storage.js';

const sourcePath = __dirname + '/../node_modules/@acala-network/eth-providers/lib/consts.js';
const destinationDir = __dirname + '/../node_modules/@acala-network/eth-providers/lib/lib';
const destinationPath = destinationDir + '/consts.js';

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