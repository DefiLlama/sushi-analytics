const http = require("http")
const PORT = process.env.PORT || 5000
const HOUR = 3600 * 1e3
const fs = require('fs')
const { exec } = require('child_process')
const dataFile = 'data.json'
const updateLog = 'updateLog.json'

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

// initialize ata files
fs.writeFileSync(dataFile, JSON.stringify({}))
fs.writeFileSync(updateLog, JSON.stringify({}))

updateData()
setInterval(updateData, HOUR)

async function updateData(){
  console.log(new Date(), '[pre-update all]')
  await new Promise((resolve) => {
    exec(['node', ' --max-old-space-size=1800', 'updateData.js'].join(' '), resolve)
  })
  console.log(new Date(), '[post-update all]')
}
