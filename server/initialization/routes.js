const express = require('express');
const boom = require('@hapi/boom')
const logger = require('../helpers/logger')
const album = require('../routes/album')
const artist = require('../routes/artist')
const playlist = require('../routes/playlist')
const song = require('../routes/song')
const user = require('../routes/user')
const logging = require('../middleware/logging')
const errorHandler = require('../middleware/errorHandler')
const auth = require('../middleware/authorization')

module.exports = function(app) {
  app.use(logging)
  app.use(express.json())
  app.use('/api/album', album)
  app.use('/api/artist', artist)
  app.use('/api/playlist', playlist)
  app.use('/api/song', song)
  app.use('/api/user', user)

  app.all('/api/*',(req,res,next)=>{
	  next(boom.notFound("Endpoint not found"))
	  
  })
  app.get('/resource/*',auth(false),(req,res,next)=>{
	  
		res.sendFile(req.path, {root: './../server/resources'},(err)=>{
			if(err && err.status==404){
        logger.info(err)
				next(boom.notFound("Resource not found"))
			}
		})
  })
  app.get('*',(req,res,next)=>{
	  
		res.sendFile(req.path, {root: './../client/public'},(err)=>{
			if(err && err.status==404){
        logger.info(err)
				next(boom.notFound("File not found"))
			}
		})
  })

  app.use(errorHandler)

}