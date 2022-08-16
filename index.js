const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const adaptersDir = './DefiLlama-Adapters/projects'
// const simpleGit = require('simple-git')
const fs = require('fs')
const dataFile = 'data.json'
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.json(JSON.parse(fs.readFileSync(dataFile)))
})

app.listen(PORT)


const projects = {
  'harvest': '/harvest.js',
  'hydradex': '/hydradex.js',
  'taiga': '/taiga/api',
  'tapio': '/tapio/api',
  'karura-lending': '/karura-lending/api',
  'karura-staking': '/karura-staking/api',
  'acala-lending': '/acala-lending/api',
  'acala-staking': '/acala-staking/api',
  'acala-lcdot': '/acala-lcdot/api',
  bifrost: '/bifrost/api',
  genshiro: '/genshiro/api',
  'acala-dex': '/acala-dex/api',
  'karura-dex': '/karura-dex/api',
  'parallel-staking': '/parallel-staking/api',
  'parallel-crowdloan': '/parallel-crowdloan/api',
  'parallelamm': '/parallelamm/api',
  'parallel-lending': '/parallel-lending/api',
  'parallel-stream': '/parallel-stream/api',
  'sushiswap': '/sushiswap/api.js',
}

const bulkyAdapters = {
  unicrypt: '/unicrypt/index',
  dxsale: '/dxsale/index',
  dexpad: '/dexpad/index',
  deeplock: '/deeplock/index',
  pinksale: '/pinksale/index',
  synthetix: '/synthetix/api',
  'team-finance': '/team-finance/index',
  // 'xdao': '/xdao.js',
}


const retries = 4;

console.log(`server started on port: ${PORT}`);

function clearData() {
  fs.writeFileSync(dataFile, JSON.stringify({})) // reset chain data
}

let i = 0

clearData()
getData()
setInterval(getData, HOUR)

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
      console.log('start', i, project, chain)
      const balances = await tvlFunction(timestamp, undefined, {})
      if (!chainData[project]) chainData[project] = {}
      chainData[project][chain] = balances
      fs.writeFileSync(dataFile, JSON.stringify(chainData))
      console.log('done', i, project, chain, timestamp)
      return;
    } catch (e) {
      console.error(project, chain, e)
    }
  }
}

// const git = simpleGit({ baseDir: './DefiLlama-Adapters' })
async function getData() {
  // try {
  //   await git.pull()
  // } catch (e) { }

  i++
  if (i === 1200000) i = 0
  if (i % 12) clearData()

  // Object.keys(bulkyAdapters).forEach(key => delete bulkyAdapters[key])
  // Object.keys(projects).forEach(key => delete projects[key])

  for (const [name, project] of Object.entries(projects))
    await updateProject(name, project)

  for (const [name, project] of Object.entries(bulkyAdapters))
    await updateProject(name, project, true)

  async function updateProject(name, project, onlyIfMissing) {
    project = require(adaptersDir + project)
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    for (const chain of chains) {
      for (const exportKey of Object.keys(project[chain])) {
        const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
        await updateData(project[chain][exportKey], projectName, chain, onlyIfMissing)
      }
    }
  }
}
