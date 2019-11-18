const express = require('express')
const User = require('./objects/User')
const logger = require('../helpers/logger')
const auth = require('../middleware/authorization')
const jwt = require('jsonwebtoken')
const boom = require('@hapi/boom')
const {promisify} = require('util')
const router = express.Router()
var config = require('../config.json')

jwt.sign = promisify(jwt.sign)

router.get('/:id?',auth(false), (req,res,next)=>{
	
	if(!req.params.id && !req.user.isadmin)
		return next(boom.forbidden("Must be admin to enumerate users"))
	User.getUser(req.params.id,req.user.isadmin)
	.then(user=>{
		res.json(user)
	})
	.catch(next)
})


router.delete('/:id',auth(false), (req,res,next)=>{
	
	if(!req.user.isadmin && req.params.id!=req.user.userid){
		return next(boom.unauthorized("Must be admin to delete another user"))
	}
	User.deleteUser(req.params.id)
	.then(()=>{
		res.send()
	})
	.catch(next)
})


router.patch('/:id',auth(false),(req,res,next)=>{
	
	if(!req.user.isadmin && req.body.isadmin==true){
		return next(boom.unauthorized("Cannot elevate yourself"))
	}
	if(!req.user.isadmin && req.params.id!=req.user.userid){
		return next(boom.unauthorized("Must be admin to change another user"))
	}
	User.updateUser(req.body,req.params.id)
	.then(user=>{
		res.send()
	})
	.catch(next)

})

router.post('/signin',(req,res,next)=>{
	var signeduser;
	User.signin(req.body)
	.then((user)=>{
		signeduser=user
		 return jwt.sign({userid:user.userid,username:user.username,isadmin:user.isadmin},config.jwtsecret,{expiresIn:"7d",issuer:"songJS"})
	})
	.then((token)=>{
		res.json({"user":signeduser,"token":token})
	})
	.catch(next)
})

router.post('/signup', (req,res,next)=>{
	User.validateNewUser(req.body)
	.then((user)=>{
		if(user.isadmin){
			return auth(true)(req,res,next)
		}
		User.storeNewUser(user).then(()=>{
			res.json(user)
		})
		.catch(next)
	})
	.catch(next)

},(req,res,next)=>{
	User.storeNewUser(req.body).then((user)=>{
		res.json(user)
	})

})

module.exports = router