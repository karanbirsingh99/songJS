const express = require('express');

const album = require('../routes/album')
const artist = require('../routes/artist')
const playlist = require('../routes/playlist')
const song = require('../routes/song')
const user = require('../routes/user')

module.exports = function(app) {
  app.use(express.json())
  app.use('/api/album', album)
  app.use('/api/artist', artist)
  app.use('/api/playlist', playlist)
  app.use('/api/song', song)
  app.use('/api/user', user)
  app.get('/*',(req,res)=>{
	  console.log('not found');
	  
  })
}