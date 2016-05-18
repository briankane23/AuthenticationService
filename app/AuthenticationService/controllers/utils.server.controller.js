logger = require('winston'),
    generator = require('rand-token').suid;

exports.ping = function(req, res) {
    res.json({
        pong: Date.now()
    });
};

exports.applyContext = function(req, res, next) {
    logger.info("Checking context..");
    if(typeof req.context == 'undefined') {
        logger.info("No context found. Creating..");
        createContext(req);
        next();
    }
};

//=================================================

createContext = function(req) {
    req.context = {
        created: Date.now(),
        context_id: generator(16)
    };

    logger.info("Context ID", req.context.context_id, "applied.");
};