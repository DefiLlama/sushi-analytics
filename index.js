const http = require("http")
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const adaptersDir = './DefiLlama-Adapters/projects'
// const simpleGit = require('simple-git')
const fs = require('fs')
const { exec } = require('child_process')
const dataFile = 'data.json'
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {
//   res.json(JSON.parse(fs.readFileSync(dataFile)))
// })

// app.listen(PORT)

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

const projects = {
  'harvest': '/harvest.js',
  'hydradex': '/hydradex.js',
  'kintsugi': '/kintsugi/api',
  'interlay': '/interlay/api',
  'taiga': '/taiga/api',
  'tapio': '/tapio/api',
  'karura-lending': '/karura-lending/api',
  'karura-staking': '/karura-staking/api',
  'acala-lending': '/acala-lending/api',
  'acala-staking': '/acala-staking/api',
  'acala-lcdot': '/acala-lcdot/api',
  'bifrost-staking': '/bifrost-staking/api',
  'bifrost-dex': '/bifrost-dex/api',
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

function clearData() {
  fs.writeFileSync(dataFile, JSON.stringify({})) // reset chain data
}

let i = 0

clearData()
getData()
setInterval(getData, HOUR)

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
}

async function updateProject(name, project, onlyIfMissing) {
  console.log(new Date(), name, project, onlyIfMissing)
  return new Promise((resolve) => {
    exec(['node', ' --max-old-space-size=1000', 'updateData.js', name, project, onlyIfMissing].join(' '), resolve)
  })
}
