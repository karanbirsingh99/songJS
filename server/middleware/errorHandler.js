const logger = require('../helpers/logger')
const boom = require('@hapi/boom')
module.exports = function errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    if(!err.isBoom){
      //don't log client syntax errors
      if(err.statusCode!=400){
          logger.error(err.toString())}
      err = boom.boomify(err,{statusCode : (err.statusCode ? err.statusCode : 500)})
    }
    res.status(err.output.statusCode)
    res.json(err.output.payload)
}