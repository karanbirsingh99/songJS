var config = require('../config.json')

module.exports = function() {

    if(config.setup){
        // load dependencies if setup is required 
        const mysql = require('mysql2/promise')
        const fs = require('fs')
        const logger = require('../helpers/logger')
        const rl = require('readline-sync')
        const crypto = require('crypto');

        (function connectDatabase(){
            const host = rl.question("Enter database host:\n")
            const username = rl.question("Enter username:\n")
            const password = rl.question("Enter password:\n",{hideEchoBack:true})

            const connection = mysql.createConnection({
                host     : host,
                user     : username,
                password : password,
                multipleStatements: true
            })
            .then(connection=>{
                config.database = {host:host,user:username,password:password}
                if(connection){
                    return connection.query(fs.readFileSync('./initialization/initializedb.sql', 'utf8'))
                }
            })
            .then(([row,fields])=>{
                
                config.setup=false
                config.jwtsecret=crypto.randomBytes(128).toString('hex')
                fs.writeFile('./config.json',JSON.stringify(config),(err)=>{
                    if(err){throw err}
                    console.log('Setup successful. Please re-start application')
                    process.exit()})
                    
            }).catch(err=>{
                logger.error(err.toString())
                console.log(`Error: ${err.code}, the credentials may not have worked. Let's try again`)
                connectDatabase()
            })
        })()
        
    }

}