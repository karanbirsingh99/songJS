const winston = require('winston')
const config = require('../config.json')

const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level:config['logging_level'],
        json: false
      }),
      new winston.transports.File({
            level:config['logging_level'],
            filename: 'logs/logs.log',
            maxsize: 10000000 
        })
    ]
  });


module.exports = logger;