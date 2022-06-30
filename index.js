const express = require('express')
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const adaptersDir = './DefiLlama-Adapters/projects'

let chainData = {}
const projects = {
  synthetix: require(adaptersDir + '/synthetix/api'),
  'karura-dex': require(adaptersDir + '/karura-dex/api'),
  'karura-lending': require(adaptersDir + '/karura-lending/api'),
  'karura-staking': require(adaptersDir + '/karura-staking/api'),
  'acala-dex': require(adaptersDir + '/acala-dex/api'),
  'acala-lending': require(adaptersDir + '/acala-lending/api'),
  'acala-staking': require(adaptersDir + '/acala-staking/api'),
  'acala-lcdot': require(adaptersDir + '/acala-lcdot/api'),
  bifrost: require(adaptersDir + '/bifrost/api'),
  genshiro: require(adaptersDir + '/genshiro/api'),
}

const bulkyAdapters = {
  dexpad: require(adaptersDir + '/dexpad/index'),
  'team-finance': require(adaptersDir + '/team-finance/index'),
  deeplock: require(adaptersDir + '/deeplock/index'),
  unicrypt: require(adaptersDir + '/unicrypt/index'),
  pinksale: require(adaptersDir + '/pinksale/index'),
}
const retries = 5;

express()
  .get('/', (req, res) => {
    if (req.query.project) {
      // if a project and chain name is passed in query, just send over those info instead of all chain data
      const {project, chain } = req.query
      let data = chainData[project]
      if (chain && data)
        data = { [chain]: data[chain] }
      return res.send({ [project]: data })
    }
    res.send(chainData)
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

function clearData() {
  chainData = [...Object.keys(projects), ...Object.keys(bulkyAdapters)].reduce((acc, i) => ({ ...acc, [i]: {} }), {}) // reset chain data
}

setInterval(clearData, 12 * HOUR)
setInterval(getData, HOUR)
setInterval(updateBulkyData, 3 * HOUR)

clearData()
getData()
updateBulkyData()

function time() {
  return Math.round(Date.now() / 1e3);
}

async function updateData(tvlFunction, project, chain, onlyIfMissing = false) {
  if (onlyIfMissing) {
    if (chainData[project] && chainData[project][chain]) return;  // update cache only if data is missing
  }
  const start = time()
  for (let i = 0; i < retries; i++) {
    const timestamp = time()
    if ((timestamp - start) > 45 * 60) {
      return
    }
    try {
      const balances = await tvlFunction(timestamp, undefined, {})
      console.log(project, chain, timestamp)
      chainData[project][chain] = balances
      return;
    } catch (e) {
      console.log(e)
      await sleepXMinutes(5)
    }
  }
}

async function sleepXMinutes(minutes = 10) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * 60 * minutes))
}

function getData() {
  Object.entries(projects).forEach(([name, project]) => {
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    chains.forEach(chain => {
      updateData(project[chain].tvl, name, chain)
    })
  })
}

// Adapters are run in sequence here, we wait for running one to finish before starting the next
async function updateBulkyData() {
  for (const [name, project] of Object.entries(bulkyAdapters)) {
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    for (const chain of chains)
      await updateData(project[chain].tvl, name, chain, true)
  }
}
