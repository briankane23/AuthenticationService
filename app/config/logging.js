/**
 * Created by brian on 04/03/2016.
 */

var winston = require('winston'),
    fs = require('fs');
var dir = 'logs/';

//create directory for logs if it doesn't exist
if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

var logger = new (winston.Logger) ({
    transports: [
        new(winston.transports.Console) (),

        new (winston.transports.File) ({
            name: 'info-file',
            filename: dir + '/log-info.log',
            level: 'info'
        }),

        new (winston.transports.File) ({
            name: 'error-file',
            filename: dir + '/log-error.log',
            level: 'error'
        })
    ]
});

logger.info("Logger initialised");

module.exports = logger;