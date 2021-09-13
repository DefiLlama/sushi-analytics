const express = require('express')
const sushi = require('./DefiLlama-Adapters/projects/sushiswap/index')
const PORT = process.env.PORT || 5000

let chainData = {}
const chains = Object.entries(sushi).filter(c=>c[1]?.tvl !== undefined).map(c=>c[0])
const retries = 5;

express()
  .get('/', (req, res) => {
    if(chains.every(c=>chainData[c]!== undefined)){
      res.send(chainData)
    } else {
      throw new Error("Not all data available")
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

setInterval(getData, 3600 * 1e3)

function getData(){
  console.log("starting")
  chains.forEach(async chain=>{
    for(let i=0; i<retries; i++){
      const timestamp = Math.round(Date.now()/1e3)
      try{
        const balances = await sushi[chain].tvl(timestamp, undefined, {})
        console.log(chain, timestamp)
        chainData[chain] = balances
        return;
      } catch(e){
        console.log(e)
      }
    }
  })
}

getData()