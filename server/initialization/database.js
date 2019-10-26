const config = require('../config.json')
const mysql = require('mysql2')
const logger = require('../logger')
if(config.database){

    const connection = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: 'songjs'
      }).on('error',(err)=>{
          logger.error(err)
      })
      module.exports = connection

}
