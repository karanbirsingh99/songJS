const express = require("express")
const router = express.Router()
const logger = require('../logger')

router.get('/', (req,res,next)=>{	
	
		res.send('album')
	}
)

module.exports = router 