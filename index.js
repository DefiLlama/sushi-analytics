const http = require("http")
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const adaptersDir = './DefiLlama-Adapters/projects'
// const simpleGit = require('simple-git')


const projects = {
  'sushiswap': require(adaptersDir + '/sushiswap/api.js'),
  'harvest': require(adaptersDir + '/harvest.js'),
  'hydradex': require(adaptersDir + '/hydradex.js'),
  'taiga': require(adaptersDir + '/taiga/api'),
  'tapio': require(adaptersDir + '/tapio/api'),
  'karura-lending': require(adaptersDir + '/karura-lending/api'),
  'karura-staking': require(adaptersDir + '/karura-staking/api'),
  'acala-lending': require(adaptersDir + '/acala-lending/api'),
  'acala-staking': require(adaptersDir + '/acala-staking/api'),
  'acala-lcdot': require(adaptersDir + '/acala-lcdot/api'),
  bifrost: require(adaptersDir + '/bifrost/api'),
  genshiro: require(adaptersDir + '/genshiro/api'),
  'acala-dex': require(adaptersDir + '/acala-dex/api'),
  'karura-dex': require(adaptersDir + '/karura-dex/api'),
  'parallel-staking': require(adaptersDir + '/parallel-staking/api'),
  'parallel-crowdloan': require(adaptersDir + '/parallel-crowdloan/api'),
  'parallelamm': require(adaptersDir + '/parallelamm/api'),
  'parallel-lending': require(adaptersDir + '/parallel-lending/api'),
  'parallel-stream': require(adaptersDir + '/parallel-stream/api'),
}

const bulkyAdapters = {
  unicrypt: require(adaptersDir + '/unicrypt/index'),
  dexpad: require(adaptersDir + '/dexpad/index'),
  dxsale: require(adaptersDir + '/dxsale/index'),
  synthetix: require(adaptersDir + '/synthetix/api'),
  deeplock: require(adaptersDir + '/deeplock/index'),
  pinksale: require(adaptersDir + '/pinksale/index'),
  'team-finance': require(adaptersDir + '/team-finance/index'),
  // 'xdao': require(adaptersDir + '/xdao.js'),
}

// const git = simpleGit({ baseDir: './DefiLlama-Adapters' })

let chainData = {}

const retries = 2;
const server = http.createServer(async (req, res) => {
  //set the request route
  // if (req.url === "/" && req.method === "GET") {
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
  // }

  // // If no route present
  // else {
  //   res.writeHead(404, { "Content-Type": "application/json" });
  //   res.end(JSON.stringify({ message: "Route not found" }));
  // }
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
      console.error(e)
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
  const projectPromises = []


  for (const [name, project] of Object.entries(projects))
    projectPromises.push(updateProject(name, project))
  
  await Promise.all(projectPromises)

  for (const [name, project] of Object.entries(bulkyAdapters))  
    await updateProject(name, project, true)

  async function updateProject(name, project, onlyIfMissing) {
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    for (const chain of chains) {
      for (const exportKey of Object.keys(project[chain])) {
        const projectName = exportKey === 'tvl' ? name : `${name}-${exportKey}`
        await updateData(project[chain][exportKey], projectName, chain, onlyIfMissing)
      }
    }
  }
}
