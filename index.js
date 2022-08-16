const http = require("http")
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const adaptersDir = './DefiLlama-Adapters/projects'
// const simpleGit = require('simple-git')


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
  dexpad: '/dexpad/index',
  deeplock: '/deeplock/index',
  pinksale: '/pinksale/index',
  'team-finance': '/team-finance/index',
  synthetix: '/synthetix/api',
  dxsale: '/dxsale/index',
  // 'xdao': '/xdao.js',
}

// const git = simpleGit({ baseDir: './DefiLlama-Adapters' })

let chainData = {}

const retries = 4;
const server = http.createServer(async (req, res) => {
  //response headers
  res.writeHead(200, { "Content-Type": "application/json" });
  //set the response
  if ((req.query || {}).project) {
    // if a project and chain name is passed in query, just send over those info instead of all chain data
    const { project, chain } = req.query
    let data = chainData[project]
    if (chain && data)
      data = { [chain]: data[chain] }
    return res.write(JSON.stringify({ [project]: data }))
  } else {
    res.write(JSON.stringify(chainData))
  }
  //end the response
  res.end();
})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
})

function clearData() {
  chainData = {} // reset chain data
}

var i = 0

setInterval(getData, HOUR)
getData()

function time() {
  return Math.round(Date.now() / 1e3);
}

async function updateData(tvlFunction, project, chain, onlyIfMissing = false) {
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
      const balances = await tvlFunction(timestamp, undefined, {})
      console.log(i, project, chain, timestamp)
      if (!chainData[project]) chainData[project] = {}
      chainData[project][chain] = balances
      return;
    } catch (e) {
      console.error(i, project, chain, e)
      // await sleepXMinutes(5)
    }
  }
}

async function sleepXMinutes(minutes = 10) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * 60 * minutes))
}

async function getData() {
  // await git.pull()

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
