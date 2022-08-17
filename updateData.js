const adaptersDir = './DefiLlama-Adapters/projects'
const fs = require('fs')
const dataFile = 'data.json'
const logFile = 'debug.log'
const errorFile = 'error.log'

const retries = 4;
function time() {
  return Math.round(Date.now() / 1e3);
}

async function updateData(tvlFunction, project, chain, onlyIfMissing = false) {
  const chainData = JSON.parse(fs.readFileSync(dataFile))
  if (onlyIfMissing) {
    if (chainData[project] && Object.keys(chainData[project][chain] || {}).length) return;  // update cache only if data is missing
  }
  const start = time()
  for (let i = 0; i < retries; i++) {
    const timestamp = time()
    if ((timestamp - start) > 45 * 60) {
      return
    }
    try {
      log('start', i, project, chain)
      const balances = await tvlFunction(timestamp, undefined, {})
      if (!chainData[project]) chainData[project] = {}
      chainData[project][chain] = balances
      fs.writeFileSync(dataFile, JSON.stringify(chainData))
      log('done', i, project, chain, timestamp)
      return;
    } catch (e) {
      error(project, chain, JSON.stringify(e))
    }
  }
}

function log() {
  fs.appendFileSync(logFile, '\n')
  fs.appendFileSync(logFile, [getDate(), ...arguments].join(' '))
}


function error() {
  fs.appendFileSync(errorFile, '\n')
  fs.appendFileSync(errorFile, [getDate(), ...arguments].join(' '))
}

function getDate() {
  return (new Date()).toISOString()
}

async function updateProject(name, project, onlyIfMissing) {
  project = require(adaptersDir + project)
  const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
  for (const chain of chains) {
    for (const exportKey of Object.keys(project[chain])) {
      const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
      await updateData(project[chain][exportKey], projectName, chain, onlyIfMissing)
      process.exit(0)
    }
  }
}

const [_, _1, name, project, onlyIfMissing] = process.argv
updateProject(name, project, onlyIfMissing === 'true')