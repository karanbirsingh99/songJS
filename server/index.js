const express = require('express')
const logger = require('./logger')

const app = express()

require("./initialization/routes")(app)
require("./initialization/setup")()
require("./initialization/database")


const port = 8080
const server = app.listen(port, () =>
  console.log(`server started on port ${port}`)
)

