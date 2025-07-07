const http = require('http')
const PORT = process.env.PORT ?? 5001
const HOUR = 3600 * 1e3
const fs = require('fs')
const dataFile = 'data.json'

const server = http.createServer(async (req, res) => {
  //response headers
  res.writeHead(200, { 'Content-Type': 'application/json' });
  //set the response
  res.write(fs.readFileSync(dataFile))
  //end the response
  res.end();
})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
})

setInterval(clearData, HOUR * 16) // reset cache every 16 hours

function clearData() {
  console.log('clearing all data')
  fs.writeFileSync(dataFile, JSON.stringify({}))
}

