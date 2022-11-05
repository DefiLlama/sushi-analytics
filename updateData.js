const adaptersDir = './DefiLlama-Adapters/projects'
const { bulky, hourlyRun } = require('./adapterMapping')
const fs = require('fs')
const dataFile = 'data.json'
const logFile = 'debug.log'
const errorFile = 'error.log'
const chainData = JSON.parse(fs.readFileSync(dataFile))
if (!chainData.lastUpdateLog) chainData.lastUpdateLog = {}
const lastUpdateLog = chainData.lastUpdateLog
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
  chainData.lastUpdateLogStr = {}
  for (const [key, date] of Object.entries(lastUpdateLog))
    chainData.lastUpdateLogStr[key] = (new Date(date)).toISOString()

  fs.writeFileSync(dataFile, JSON.stringify(chainData))
}

async function updateData(tvlFunction, project, chain, onlyIfMissing = false) {
  // if (onlyIfMissing) {
  //   if (chainData[project] && Object.keys(chainData[project][chain] || {}).length) return;  // update cache only if data is missing
  // }
  const timestamp = time()
  log('[start]', project, chain)
  const balances = await tvlFunction(timestamp, undefined, {})
  writeToFile(chain, project, balances)
  log('[done]', project, chain, 'time taken: ', time() - timestamp)
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
  project = require(adaptersDir + project)
  const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])

  try {
    deleteProject(name, project, chains)

    for (const chain of chains) {
      for (const exportKey of Object.keys(project[chain])) {
        const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
        await updateData(project[chain][exportKey], projectName, chain)
      }
    }

    lastUpdateLog[name] = Date.now()
    writeToFile()

  } catch (e) {
    error(project, JSON.stringify(e))
    deleteProject(name, project, chains)
  }
}

function deleteProject(name, project, chains) {
  for (const chain of chains) {
    for (const exportKey of Object.keys(project[chain])) {
      const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
      delete chainData[projectName]
      writeToFile()
    }
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