const express = require('express')

const app = express()

require("./initialization/routes")(app)



const server = app.listen(80, () =>
  console.log("server started")
)