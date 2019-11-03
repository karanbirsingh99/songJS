const pool = require("../../initialization/database")
const joi = require("@hapi/joi")
const bcrypt = require('bcrypt')
const boom = require('@hapi/boom')
const saltRounds = 11

const credentialSchema = joi.object({

     username: joi.string()
        .alphanum()
        .min(3)
        .max(32)
        .required(),

     password: joi.string()
        .min(8)
        .max(255)
        .required()

})


const userSchema = joi.object({

    firstname: joi.string()
        .min(2)
        .max(255)
        .required(),
  
    lastname: joi.string()
        .min(2)
        .max(255),

    isadmin: joi.boolean()
        .required(),

    email: joi.string()
        .email({ minDomainSegments: 2})
        .required()
}).concat(credentialSchema)


module.exports={

    validateNewUser(user){
        return new Promise((resolve,reject)=>{
            userSchema.validateAsync(user)
            .then(val=>{
                return val
            })
            .catch(err=>{
                return reject(boom.boomify(err,{statusCode:400}))
            })
            .then(user=>{
                return pool.query("select count(*) as count from user where username=? union select count(*) as count from user where email=?;",[user.username,user.email])
            })
            .then(([row,fields])=>{
                if(row.length==1 && row[0].count==1){
                    return reject(boom.unauthorized(`User with the username '${user.username}' and email '${user.email}' already exists`))
                }
                if(row.length==2 && row[0].count==1){
                    return reject(boom.unauthorized(`User with the username '${user.username}' already exists`))
                }
                if(row.length==2 && row[0].count==0){
                    return reject(boom.unauthorized(`User with the email '${user.email}' already exists`))
                }
                resolve(user)
            })
            .catch(err=>{
                reject(boom.boomify(err,{statusCode:500}))
            })

        })

    },
    storeNewUser(user){
        return new Promise((resolve,reject)=>{
            bcrypt.hash(user.password, saltRounds)
            .then(function(hash) {
                return pool.query("insert into user (username,password,email,isadmin,firstname,lastname) values (?,?,?,?,?,?)",[user.username,hash,user.email,user.isadmin,user.firstname,user.lastname])
            })
            .then(([row,fields])=>{
                delete user.password
                resolve(user)
            })
            .catch(err=>{
                reject(boom.boomify(err,{statusCode:500}))
            })

        })

    },
    signin(credentials){
        return new Promise((resolve,reject)=>{
            credentialSchema.validateAsync(credentials)
            .then(val=>{
                return pool.query("select userid,username,email,firstname,lastname,lastname,joindate,isadmin,password from user where username=?",[credentials.username])
            })
            .then(([row,fields])=>{
                if(!row[0]){
                    return reject(boom.unauthorized("Invalid username or password"))
                }
                credentials.user = row[0]
                return bcrypt.compare(credentials.password, row[0].password)
            })
            .then((res)=>{
                if(!res){
                    return reject(boom.unauthorized("Invalid username or password"))
                }
                delete credentials.user.password
                resolve(credentials.user)
            })
            .catch(err=>{
                reject(boom.boomify(err,{statusCode:500}))
            })

        })

    }
    

}