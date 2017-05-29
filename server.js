const http = require('http')
const express = require('express')

let app = express()
app.get('/', function (req, res) { 

  return res.json({
    hello: 'world!'
  })

})

let server = http.createServer(app)
server.listen(3000)