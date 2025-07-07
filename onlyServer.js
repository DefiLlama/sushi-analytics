const http = require('http')
const PORT = process.env.PORT ?? 5001
const HOUR = 3600 * 1e3
const fs = require('fs')
const dataFile = './data.json'

const server = http.createServer(async (_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });

  // Check if data.json exists, if not return empty object
  if (!fs.existsSync(dataFile)) {
    res.end('{}');
    return;
  }

  fs.createReadStream(dataFile).pipe(res)
  //end the response - removed res.end() as pipe will handle it
})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
})

setInterval(clearData, HOUR * 16) // reset cache every 16 hours

function clearData() {
  console.log('clearing all data')
  fs.writeFileSync(dataFile, JSON.stringify({}))
}

