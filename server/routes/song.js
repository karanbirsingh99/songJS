const express = require("express")
const auth = require('../middleware/authorization')

const router = express.Router()
const Song = require("./objects/Song")

router.get('/:id',auth(false), (req,res,next)=>{	
		Song.getSong(req.params.id)
		.then((result)=>{
			res.send(result)
		})
		.catch(next)
	}
)


router.patch('/:id', (req,res)=>{	
	
		//edit song info 

	
	
	}
)

router.get('/:id/data', (req,res)=>{	
	
		//get song data

	
	
	}
)


router.post('/:id/play',auth(false), (req,res,next)=>{	
	
		//register song as played
		Song.play(req.params.id)
		.then(()=>{
			res.json(req.params.id)
		})
		.catch(next)

	
	
	}
)


router.delete('/:id',auth(true), (req,res,next)=>{	
	
		//delete a song  
		Song.deleteSong(req.params.id)
		.then(()=>{
			res.json(req.params.id)
		})
		.catch(next)


	
	
	}
)

router.post('/', (req,res)=>{	
	
		//add song  

	
	
	}
)

module.exports = router 