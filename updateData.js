process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
})

const adaptersDir = './DefiLlama-Adapters/projects'
const { bulky, hourlyRun } = require('./DefiLlama-Adapters/projects/helper/sushi-server/adapterMapping')
const sdk = require("@defillama/sdk");
const fs = require('fs')
const dataFile = 'data.json'
const logFile = 'debug.log'
const errorFile = 'error.log'
let chainData

try {
  chainData = JSON.parse(fs.readFileSync(dataFile))
} catch (e) {
  chainData = {}
}


function time() {
  return Math.round(Date.now() / 1e3);
}

function writeToFile(chain, project, data) {
  if (project) {
    if (!chainData[project]) chainData[project] = {}
    chainData[project][chain] = data
  }

  fs.writeFileSync(dataFile, JSON.stringify(chainData))
}

async function updateData(tvlFunction, project, chain, onlyIfMissing = false) {
  if (onlyIfMissing) {
    if (chainData[project] && Object.keys(chainData[project][chain] || {}).length) return;  // update cache only if data is missing
  }
  const timestamp = time()
  log('[start]', project, chain)
  const api = new sdk.ChainApi({ chain, timestamp: Math.floor(new Date() / 1e3), })
  api.timestamp = timestamp
  const balances = await tvlFunction(api, undefined, {}, { api, chain, storedKey: project })
  writeToFile(chain, project, balances)
  log('[done]', project, chain, 'time taken: ', time() - timestamp)
}

function log(...args) {
  fs.appendFileSync(logFile, '\n')
  fs.appendFileSync(logFile, [getDate(), ...args].join(' '))
}


function error(...args) {
  fs.appendFileSync(errorFile, '\n')
  fs.appendFileSync(errorFile, [getDate(), ...args].join(' '))
}

function getDate() {
  return (new Date()).toISOString()
}

async function updateProject(name, project, onlyIfMissing) {
  const projectStr = project
  try {

    project = require(adaptersDir + project)
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    // let promises = []

    for (const chain of chains) {
      for (const exportKey of Object.keys(project[chain])) {
        const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
        await updateData(project[chain][exportKey], projectName, chain, onlyIfMissing)
        // promises.push(updateData(project[chain][exportKey], projectName, chain, onlyIfMissing)) 
      }
    }

    // await Promise.all(promises)

    writeToFile()
  } catch (e) {
    console.error(e)
    error(name, projectStr, JSON.stringify(e))
  }
}

async function updateProjectGroup(group, onlyIfMissing) {
  const items = Object.entries(group)
  // shuffle items
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  for (const [name, project] of items)
    await updateProject(name, project, onlyIfMissing)
}

async function main() {
  const adapterKey = process.env.RUN_ONLY
  if (adapterKey) {
    const group = {};
    ([...hourlyRun, ...bulky]).flat().forEach(i => {
      if (i[adapterKey]) group[adapterKey] = i[adapterKey]
    })

    if (!group[adapterKey]) throw new Error('Adapter mapping not found!')
    return updateProjectGroup(group)
  }

  for (const projectGroups of hourlyRun)
    await Promise.all(projectGroups.map(updateProjectGroup))

  for (const projectGroups of bulky)
    await Promise.all(projectGroups.map(group => updateProjectGroup(group, true)))
}

main().then(() => {
  console.log('Done, exiting...')
  writeToFile()
  process.exit(0)
})

// Function to exit the script
function exitScript() {
  console.log('Exiting script...');
  process.exit(0); // Exit with a status code of 0
}

// Schedule the script to exit after 50 minutes
const durationInMinutes = 50;
const durationInMilliseconds = durationInMinutes * 60 * 1000;
console.log(`Will auto exit in ${durationInMinutes} minutes`);
setTimeout(exitScript, durationInMilliseconds);

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});