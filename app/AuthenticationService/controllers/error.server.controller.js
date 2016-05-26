errors = require('../resources/errorDefinitions');

exports.attachHandler = function(req, res, next) {
    req.err = function(errorCode) {
        definition = lookupDefinition(errorCode, function(errorCode, definition) {
            console.log("Definition:", definition);
            error = {
                code: errorCode,
                error: definition,
                time: Date.now(),
                endpoint: req.originalUrl,
                params: req.params || "None Set",
                user: req.user || "None"
            }
            logger.error(error);
            res.json(error);
        });
    }

    next();
}

function lookupDefinition(errorCode, callback) {
    if (errors.hasOwnProperty(errorCode)) {
        def = errors[errorCode];
    } else {
        logger.error("Error Code is non existant, defaulting to unknown error:", errorCode);
        errorCode = 1000;
        def = errors[errorCode];
    }
    process.nextTick(function() {
        callback(errorCode, def);
    });
}