const express = require("express")
const router = express.Router()
const Song = require("./objects/Song")

router.get('/:id', (req,res,next)=>{	
		Song.getSong(req.params.id).then((result)=>{
			if(!result) res.status(404).json({"error":"song not found"})
			res.send(result)

		}).catch((err)=>{

			return next(err)

		})

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


router.post('/:id/played', (req,res)=>{	
	
		//register song as played  

	
	
	}
)


router.delete('/:id', (req,res)=>{	
	
		//delete a song  

	
	
	}
)

router.post('/', (req,res)=>{	
	
		//add song  

	
	
	}
)

module.exports = router 