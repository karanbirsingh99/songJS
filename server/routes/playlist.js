const express = require('express')
const auth = require('../middleware/authorization')
const router = express.Router()
const Playlist = require('./objects/Playlist')
const boom = require('@hapi/boom')
router.use(auth(false))

router.get('/public',auth(false), (req,res,next)=>{

	Playlist.getPublicPlaylists()
	.then(result=>{
		res.json(result)
	})
	.catch(next)

})
router.get('/:id?',auth(false), (req,res,next)=>{

	let resultPromise
	let id = req.params.id
	if(id){
		resultPromise=Playlist.getPlaylist(id,req.user.userid)
	}
	else{
		resultPromise=Playlist.getUserPlaylists(req.user.userid)
	}
	resultPromise.then(result=>{
		if(id && !req.user.isadmin && result.ispublic==0 && result.user.userid!=req.user.userid){
			return next(boom.forbidden("This playlist is set to private"))
		}
		res.json(result)
	})
	.catch(next)
	
})


router.delete('/:id',auth(false), (req,res,next)=>{
	
	//delete playlist
	let promise
	if(!req.user.isadmin){
		promise=Playlist.ownsPlaylist(req.user.userid,req.params.id)
		.then((isOwner)=>{
			if(!isOwner){
				throw boom.forbidden("Cannot delete another user's playlist")
			}
			return Playlist.deletePlaylist(req.params.id)
		})
	}
	else{
	promise = Playlist.deletePlaylist(req.params.id)
	}
	promise.then(()=>{res.send()})
	.catch(next)
	
})

router.post('/',auth(false),(req,res,next)=>{	
	
		//create playlist
		let playlist=req.body
		playlist.userid=req.user.userid
		Playlist.createPlaylist(playlist)
		.then((playlist)=>{
			return res.send(playlist)
		})
		.catch(next)
	
	}
)

router.patch('/:id',auth(false),(req,res,next)=>{	 
	
	//edit playlist
	let promise
	if(!req.user.isadmin){
		promise=Playlist.ownsPlaylist(req.user.userid,req.params.id)
		.then(isOwner=>{
			if(!isOwner){
				throw boom.forbidden("Cannot alter another user's playlist")
			}
			return Playlist.updatePlaylist(req.body,req.params.id)
		})
	}
	else{
		promise = Playlist.updatePlaylist(req.body,req.params.id)
	}
	promise.then(playlist=>{res.send(playlist)})
	.catch(next)
	
})

router.put('/:id',(req,res)=>{	
	
		//add song to playlist
	
	
	}
)

router.delete('/:id/:songid',(req,res)=>{	
	
		//delete song from playlist
	
	
	}
)


module.exports = router 