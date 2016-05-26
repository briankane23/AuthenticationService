authenticationService = {
    servers: [
        "localhost"
    ],
    port: 3300,
    apiEntrypoint: '/api',
    validationEndpoint: '/validate'
}

tokenCache = {};

checkCache = function(token_id, callback) {
    if(tokenCache.hasOwnProperty(token_id)) {
        logger.info("Token exists in cache", token_id);
        token = tokenCache[token_id];
        process.nextTick(function() {
            callback(null, token);
        });
    } else {
        logger.info("Token not available in cache", token_id);
        err = true;
        callback(err);
    }
};

addToCache = function(token) {
    console.log(token);
    logger.info("Adding token to cache", token.token_id);
    tokenCache[token.token_id] = token;
};

killToken = function(token_id, callback) {
    if(tokenCache.hasOwnProperty(token_id)) {
        logger.info("Token found, killing:", token_id);
        token = tokenCache[token_id];
        delete(tokenCache[token_id]);
        process.nextTick(function() {
            if(!tokenCache.hasOwnProperty(token_id)) {
                callback(null, token);
            } else {
                callback(1008); //failed to kill token
            }
        });
    } else {
        callback(1007); //token does not exist
    };
}

getTokens = function(callback) {
    callback(null, tokenCache);
};

checkDate = function(token) {
    if(Date.now() < token.valid_to) {
        return true;
    } else return false;
};

checkIP = function(req, token) {
    if(req.ip == token.ip_address) {
        return true;
    } else {
        if(token.ip_address = "::1") {
            logger.info("Localhost detected! Ignoring token mismatch for testing purposes..") //TODO fix this
            return true;
        }
        return false;
    }
};

setInterval(function() {
    now = Date.now();
    logger.info("CLIENT: Cancelling out of date tokens. Base time:", now);
    Object.keys(tokenCache).forEach(function(token) {
        if(tokenCache[token].valid_to < now) {
            killToken(token);
        }
    });
}, 6000);

exports.killToken = killToken;
exports.getTokens = getTokens;
exports.getAuthenticationService = authenticationService.servers[0];
exports.getAuthenticationPort = authenticationService.port;
exports.getAPIEntryPoint = authenticationService.apiEntrypoint;
exports.getValidationEndpoint = authenticationService.validationEndpoint;
exports.checkCache = checkCache;
exports.addToCache = addToCache;
exports.checkDate = checkDate;
exportscheckIP = checkIP;