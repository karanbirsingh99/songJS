const pool = require("../../initialization/database")
const joi = require("@hapi/joi")
const bcrypt = require('bcrypt')
const boom = require('@hapi/boom')
const saltRounds = 11

const credentialSchema = joi.object({

     username: joi.string()
        .alphanum()
        .min(3)
        .max(32),

     password: joi.string()
        .min(8)
        .max(255)
})

const userSchema = joi.object({

    firstname: joi.string()
        .min(2)
        .max(255),
  
    lastname: joi.string()
        .min(2)
        .max(255)
        .optional(),
    isadmin: joi.boolean(),

    email: joi.string()
        .email({ minDomainSegments: 2})

}).concat(credentialSchema)


module.exports={
    getUser(id,isadmin){
        return new Promise((resolve,reject)=>{
            let sql;
             if(!isadmin && id){
                sql = "select userid,username,firstname,lastname,joindate,isadmin from user where userid = "+pool.escape(id)
             }
            else if(isadmin && id){
                sql = "select userid,username,email,firstname,lastname,joindate,isadmin from user where userid = "+pool.escape(id)
            }
            else{
                sql = "select userid,username,email,firstname,lastname,joindate,isadmin from user"
            }
            pool.query(sql)
            .then(([row,fields])=>{
                if(row.length==0){
                    return reject(boom.notFound("Invalid UserID"))
                }
                resolve((row.length==1)?row[0]:row)
            })
            .catch(reject)

        })
    },
    deleteUser(id){
        return new Promise((resolve,reject)=>{
            pool.query("delete from user where userid = ?",[id])
            .then((result,fields)=>{
                if(result.affectedRows==0){
                    return reject(boom.notFound("Invalid UserID"))
                }
                resolve()
            }).catch(err=>{
                if(err.code=="ER_SIGNAL_EXCEPTION"){
                    return reject(boom.unauthorized(err.sqlMessage))
                }
                return reject(err)
            })

        })

    },
    validateNewUser(user){
        return new Promise((resolve,reject)=>{
            userSchema.validateAsync(user,{presence:'required'})
            .catch(err=>{
                return reject(boom.boomify(err,{statusCode:400}))
            })
            .then(user=>{
                return pool.query("select count(1) as count from user where username=? union select count(*) as count from user where email=?",[user.username,user.email])
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
            .catch(reject)

        })

    },
    storeNewUser(user){
        return new Promise((resolve,reject)=>{
            bcrypt.hash(user.password, saltRounds)
            .then(function(hash) {
                user.password=hash
                return pool.query("insert into user (username,password,email,isadmin,firstname,lastname) values (?,?,?,?,?,?)",[user.username,hash,user.email,user.isadmin,user.firstname,user.lastname])
            })
            .then(([row,fields])=>{
                delete user.password
                resolve(user)
            })
            .catch(reject)

        })

    },
    updateUser(user,id){
        return new Promise((resolve,reject)=>{
            userSchema.min(1).validateAsync(user,{presence:'optional'})
            .catch(err=>{
                return reject(boom.boomify(err,{statusCode:400}))
            })
            .then(user=>{
                function sqlUpdate(user){
                    var keys = Object.keys(user)
                    objectArray = keys.map(k=>{return{[k]:user[k]}})
                    objectArray.push(id)
                    return pool.query("update user set "+"?,".repeat(keys.length-1)+"? where userid=?",objectArray)
                }
                if(user.password){
                    return bcrypt.hash(user.password, saltRounds)
                    .then(hash=>{
                        user.password=hash
                        return sqlUpdate(user)
                })
                }
                return sqlUpdate(user)
            })
            .then(([result,fields])=>{
                if(result.affectedRows==0){
                    return reject(boom.notFound("Invalid UserID"))
                }
                resolve()
            })
            .catch(err=>{
                if(err.code=="ER_DUP_ENTRY"){
                    return reject(boom.unauthorized("Username/email already taken"))
                }
                reject(err)
            })

        })
    },
    signin(credentials){
        return new Promise((resolve,reject)=>{
            credentialSchema.validateAsync(credentials,{presence:'required'})
            .then(val=>{
                return pool.query("select userid,username,email,firstname,lastname,lastname,joindate,isadmin,password from user where username=?",[credentials.username])
            })
            .catch(err=>{
                return reject(boom.boomify(err,{statusCode:400}))
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
            .catch(reject)

        })

    }
    

}