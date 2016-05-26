logger = require('winston'),
    generator = require('rand-token').suid,
    tokenClient = require('../resources/tokenClient'),
    request = require('request');

service = {
    identifier: 'auth_1',
    service_name: 'Authentication Service (Client)',
    service_ip: 'localhost',
    service_port: '3300'
};

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

exports.authenticate = function(req, res, next) {
    if (!req.query.tokenId) {
        req.err(1003);
    } else {
        token_id = req.query.tokenId;
        logger.info("API Request received, authenticating token", token_id);
        authenticate(token_id, function(err, token) {
            if(err) {
                req.err(err);
            } else {
                next();
            }
        });
    }
};

// Allows the Authentication Service to remotely kill a token on any client
exports.killToken = function(req, res) {
    token_id = req.query.tokenId;
    logger.info("Request received from AuthenticationService to kill token", token_id);
    tokenClient.killToken(token_id, function(err, token) {
        if(err) {
            req.err(err);
        } else {
            res.json(token);
        }
    });
};

exports.getTokens = function(req, res) {
    logger.info("Returning currently held client tokens");
    tokenClient.getTokens(function(err, tokens) {
        if(err){
            req.err(err);
        } else {
            res.json(tokens);
        }
    })
}

exports.testValidation = function(req, res) {
    if(req.query.tokenId) {
        logger.info("WORKING!");
        res.send("WORKING");
    } else {
        req.err(1003);
    }
}

//=================================================

createContext = function(req) {
    req.context = {
        created: Date.now(),
        context_id: generator(16)
    };

    logger.info("Context ID", req.context.context_id, "applied.");
};

function authenticate(token_id, callback) {
    tokenClient.checkCache(token_id, function(err, token) {
        if(err) {
            logger.info("Token not found in cache, attempting to validate with authentication server");
            validateToken(token_id, function(err, token) {
                if(err) {
                    callback(err);
                } else {
                    tokenClient.addToCache(token);
                    callback(null, token);
                }
            });
        } else {
            logger.info("Token available in token cache");
            if(!tokenClient.checkDate(token)) {
                callback(1004);
            } else if (!tokenClient.checkIP) {
                callback(1005);
            } else {
                callback(null, token);
            }
        }
    });
}

function validateToken(token_id, callback) {
    url = assembleTokenRequest(token_id);
    try {
        request.post({
            url: URI,
            form: {
                service: service
            }
        }, function(err, response, body) {
            if(response.statusCode == 200) {
                token = JSON.parse(body);
                logger.info("Successfully validated token");
                callback(null, token);
            } else {
                logger.info("Failed to validate token", err);
                callback(1006);
            }
        });
    } catch (ex) {
        logger.error("Cannot communicate with the authentication service", ex);
    }
}

function assembleTokenRequest(token_id) {
    URI = "http://" + tokenClient.getAuthenticationService + ":" + tokenClient.getAuthenticationPort + tokenClient.getAPIEntryPoint + tokenClient.getValidationEndpoint + "?tokenId=" + token_id;
    logger.info("Setting Authentication Service Validation point to", URI);
    return URI;
};