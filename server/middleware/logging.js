const logger = require('../helpers/logger.js')
module.exports = function logging (req, res, next) {
    logger.info({
        "request URL":req.originalUrl,
        "request method":req.method})
    next()
}