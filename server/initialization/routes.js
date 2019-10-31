const express = require('express');

const album = require('../routes/album')
const artist = require('../routes/artist')
const playlist = require('../routes/playlist')
const song = require('../routes/song')
const user = require('../routes/user')
const logging = require('../middleware/logging')
const errorHandler = require('../middleware/errorHandler')

module.exports = function(app) {
  app.use(logging)
  app.use(express.json())
  app.use('/api/album', album)
  app.use('/api/artist', artist)
  app.use('/api/playlist', playlist)
  app.use('/api/song', song)
  app.use('/api/user', user)

  app.all('/api/*',(req,res)=>{
	  res.status(404).send({'error':'endpoint not found'})
	  
  })
  app.get('*',(req,res)=>{
	  
		res.sendFile(req.path, {root: './../client'},(err)=>{
			if(err.status==404){
				res.status(404).send({'error':'file not found'})
			}
		})
  })

  app.use(errorHandler)

}