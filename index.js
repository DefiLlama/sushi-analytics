const http = require("http")
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const fs = require('fs')
const { exec } = require('child_process')
const dataFile = 'data.json'

const server = http.createServer(async (req, res) => {
  //response headers
  res.writeHead(200, { "Content-Type": "application/json" });
  //set the response
  res.write(fs.readFileSync(dataFile))
  //end the response
  res.end();
})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
})

const projectsGrouped = {
  indie: {
    'harvest': '/harvest.js',
    'hydradex': '/hydradex.js',
  // },
  // bifrost: {
    'bifrost-staking': '/bifrost-staking/api',
    'bifrost-dex': '/bifrost-dex/api',
  // },
  // genshiro: {
    'genshiro': '/genshiro/api',
  // },
  // indie: {
    'sushiswap': '/sushiswap/api',
  // },
  // interlay: {
    'interlay-btc': '/interlay-btc/api',
    'interlay-staking': '/interlay-staking/api',
    'interlay-collateral': '/interlay-collateral/api',
    // },
    // parallel: {
    'parallel-staking': '/parallel-staking/api',
    'parallel-crowdloan': '/parallel-crowdloan/api',
    'parallelamm': '/parallelamm/api',
    'parallel-lending': '/parallel-lending/api',
    'parallel-stream': '/parallel-stream/api',
  // },
  // acala: {
    'acala-staking': '/acala-staking/api',
    'acala-lcdot': '/acala-lcdot/api',
    'tapio': '/tapio/api',
    // },
    // karura: {
    'karura-lending': '/karura-lending/api',
    'karura-staking': '/karura-staking/api',
    'taiga': '/taiga/api',
    // },
    // kintsugi: {
    'kintsugi': '/kintsugi/api',
  },
  bulky: {
    'kamino': '/kamino/api',
    'xdao': '/xdao/apiCache',
    unicrypt: '/unicrypt/apiCache',
    dxsale: '/dxsale/apiCache',
    dexpad: '/dexpad/apiCache',
    'acala-lending': '/acala-lending/api',
    'acala-dex': '/acala-dex/api',
    'karura-dex': '/karura-dex/api',
    deeplock: '/deeplock/apiCache',
    pinksale: '/pinksale/apiCache',
    'team-finance': '/team-finance/apiCache',
    synthetix: '/synthetix/apiCache',
  },
}

function clearData() {
  fs.writeFileSync(dataFile, JSON.stringify({})) // reset chain data
}

let i = 0

clearData()
getData()
setInterval(getData, HOUR)

async function getData() {
  i++
  if (i === 1200000) i = 0
  if (i % 12) clearData()


  for (const item of Object.entries(projectsGrouped)) {
    await updateProjects(item)
  }
}

async function updateProjects([group, projects]) {
  for (const [name, project] of Object.entries(projects)) {
    await updateProject(name, project, group === 'bulky')
    console.log(new Date(), '[post-update]', name, project)
  }
}

async function updateProject(name, project, onlyIfMissing) {
  console.log(new Date(), '[pre-update]', name, project, onlyIfMissing)
  return new Promise((resolve) => {
    // ?? improve but batching here, so single connection object is made per polka chain
    exec(['node', ' --max-old-space-size=1000', 'updateData.js', name, project, onlyIfMissing].join(' '), resolve)
  })
}
