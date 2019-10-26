const logger = require('../logger')
module.exports = function errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }

    logger.error(err)
    res.status(500)
    res.json({'error':err})
}