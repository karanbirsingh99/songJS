var config = require('../config.json')

module.exports = function() {

    if(config.setup){
        // load dependencies if setup is required 
        const mysql = require('mysql2/promise')
        const fs = require('fs')
        const logger = require('../logger')
        const rl = require('readline-sync')

        connectDatabase()
        function connectDatabase(){
            var host = rl.question("Enter database host:\n")
            var username = rl.question("Enter username:\n")
            var password = rl.question("Enter password:\n",{hideEchoBack:true})

            var connection = mysql.createConnection({
                host     : host,
                user     : username,
                password : password,
                multipleStatements: true
            }).then((connection)=>{
                console.log("Connection successful, setting up database")
                config.database = {host:host,user:username,password:password}
                connection.query(fs.readFileSync('./initialization/initializedb.sql', 'utf8'), (err, results)=>{
                    if(err){
                        return logger.error(err)
                    }
                    config.setup=false
                    fs.writeFile('./config.json',JSON.stringify(config),(err)=>{if(err){throw err}})
                    console.log('Setup successful.')

                })
            },
                (err)=>{
                    logger.error(err)
                    console.log(`Error: ${err.code}, the credentials may not have worked. Let's try again`)
                    return connectDatabase()
            })
            


                

            
            
            
        }
        

    }

}