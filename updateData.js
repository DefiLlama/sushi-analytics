const adaptersDir = './DefiLlama-Adapters/projects'
const { bulky, hourlyRun } = require('./adapterMapping')
const fs = require('fs')
const dataFile = 'data.json'
const logFile = 'debug.log'
const errorFile = 'error.log'
const updateLog = 'updateLog.json'
const chainData = JSON.parse(fs.readFileSync(dataFile))
const lastUpdateLog = JSON.parse(fs.readFileSync(updateLog))
const HOUR = 3600 * 1e3
const refreshFrequency = 12 * HOUR

function time() {
  return Math.round(Date.now() / 1e3);
}

function writeToFile(chain, project, data) {
  if (project) {
    if (!chainData[project]) chainData[project] = {}
    chainData[project][chain] = data
  }
  fs.writeFileSync(dataFile, JSON.stringify(chainData))
  fs.writeFileSync(updateLog, JSON.stringify(lastUpdateLog))
}

async function updateData(tvlFunction, project, chain, onlyIfMissing = false) {
  if (onlyIfMissing) {
    if (chainData[project] && Object.keys(chainData[project][chain] || {}).length) return;  // update cache only if data is missing
  }
  const timestamp = time()
  try {
    log('[start]',project, chain)
    const balances = await tvlFunction(timestamp, undefined, {})
    writeToFile(chain, project, balances)
    log('[done]',project, chain, 'time taken: ', time() - timestamp)
  } catch (e) {
  }
}

function log(...args) {
  console.log(...args)
  fs.appendFileSync(logFile, '\n')
  fs.appendFileSync(logFile, [getDate(), ...args].join(' '))
}


function error(...args) {
  console.log('[error]', ...args)
  fs.appendFileSync(errorFile, '\n')
  fs.appendFileSync(errorFile, [getDate(), ...args].join(' '))
}

function getDate() {
  return (new Date()).toISOString()
}

async function updateProject(name, project, onlyIfMissing) {
  try {

    const timeSinceLastUpdate = Date.now() - (lastUpdateLog[name] || 0)
    if (timeSinceLastUpdate > refreshFrequency || !onlyIfMissing) {
      delete chainData[project]
      writeToFile()
    }

    project = require(adaptersDir + project)

    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    for (const chain of chains) {
      for (const exportKey of Object.keys(project[chain])) {
        const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
        await updateData(project[chain][exportKey], projectName, chain, onlyIfMissing)
      }
    }

    lastUpdateLog[name] = Date.now()
    writeToFile()

  } catch (e) {
    error(project, JSON.stringify(e))
    delete chainData[project]
  }
}

async function updateProjectGroup(group, onlyIfMissing) {
  for (const [name, project] of Object.entries(group))
    await updateProject(name, project, onlyIfMissing)
}

async function main() {
  for (const projectGroups of hourlyRun)
    await Promise.all(projectGroups.map(updateProjectGroup))
  
  return updateProjectGroup(bulky, true)
}

main().then(() => {
  console.log('Done, exiting...')
  writeToFile()
  process.exit(0)
})