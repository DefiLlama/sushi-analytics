const express = require('express')
const sushi = require('./DefiLlama-Adapters/projects/sushiswap/api')
const mdex = require('./DefiLlama-Adapters/projects/mdex/api')
const synthetix = require('./DefiLlama-Adapters/projects/synthetix/api')
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3

let chainData = {}
const projects = {
  sushi,
  mdex,
  synthetix
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

function time(){
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
    }
  }
}
function getData() {
  console.log("starting")
  Object.entries(projects).forEach(([name, project])=>{
    const chains = Object.entries(project).filter(c => c[1]?.tvl !== undefined).map(c => c[0])
    chains.forEach(chain => {
      updateData(project[chain].tvl, name, chain)
    })
  })
}