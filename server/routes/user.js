const express = require('express')
const User = require('./objects/User')
const logger = require('../helpers/logger')
const auth = require('../middleware/authorization')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const router = express.Router()
var config = require('../config.json')

jwt.sign = promisify(jwt.sign)

router.get('/:id', (req,res)=>{
	
		res.send('user')
	}
)
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
	})
	.catch(next)

},(req,res,next)=>{
	User.storeNewUser(req.body).then((user)=>{
		res.json(user)
	})

})

module.exports = router 