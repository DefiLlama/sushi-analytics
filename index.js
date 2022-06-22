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
  bifrost: require(adaptersDir + '/bifrost/api'),
  genshiro: require(adaptersDir + '/genshiro/api'),
}
const retries = 5;

express()
  .get('/', (req, res) => {
    res.send(chainData)
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

function clearData() {
  chainData = Object.keys(projects).reduce((data, project) => {
    data[project] = {}
    return data
  }, {})
}

setInterval(clearData, 12 * HOUR)
clearData()
setInterval(getData, HOUR)
getData()

function time() {
  return Math.round(Date.now() / 1e3);
}

async function updateData(tvlFunction, project, chain) {
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
  console.log("starting")
  Object.entries(projects).forEach(([name, project]) => {
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    chains.forEach(chain => {
      updateData(project[chain].tvl, name, chain)
    })
  })
}
