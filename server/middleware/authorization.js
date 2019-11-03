const boom = require('@hapi/boom')
const {promisify} = require('util')
const jwt = require('jsonwebtoken')
var config = require('../config.json')

jwt.verify = promisify(jwt.verify)

module.exports = function Authorization(isadmin){
    return function(req, res, next){
        if (!req.headers.authorization){
            return next(boom.unauthorized("No token given"))
        }
        jwt.verify(req.headers.authorization,config.jwtsecret)
        .then(payload=>{
            req.user=payload
            if(isadmin && !req.user.admin){
                return next(boom.unauthorized("Must be admin to perform this action"))
            }
            return next()
        })
        .catch(err=>{
            return next(boom.boomify(err,{statusCode:401}))
        })

}}