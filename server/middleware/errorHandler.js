const logger = require('../helpers/logger')
const boom = require('@hapi/boom')
module.exports = function errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    if(!err.isBoom){
      logger.error(err.toString())
      err = boom.boomify(err,{statusCode : (err.statusCode ? err.statusCode : 500)})
    }
    else if(err.output.statusCode==500){
      logger.error(err)
    }
    res.status(err.output.statusCode)
    res.json(err.output.payload)
}