var logger = require('winston'),
    request = require('request');

var services = {};
var tokens = {};

exports.addServiceToToken = function(service, token_id) {
    logger.info("Adding record for service", service.identifier, "to token", token_id);
    if(!services.hasOwnProperty(service.identifier)) {
        addService(service);
    } else {
        addContact(service.identifier);
    }

    if(!tokens.hasOwnProperty(token_id)) {
        addToken(token_id);
    }

    tokens[token_id].unshift(services[service.identifier]);
}

exports.invalidateServices = function(token_id) {
    logger.info("Attempting to invalidate existing accesses across services for token", token_id);
    tokens[token_id].forEach(function(service) {
        logger.info("Invalidating token", token_id, "on service", service.identifier);
        var url = constructUrl(service, token_id);
        try {
            invalidateService(url);
        } catch (ex) {
            logger.info("Failed to issue HTTP request to service", service.identifier);
        }
    });
}

exports.getServicesByToken = function(token_id, callback) {
    logger.info("Looking up services using token", token_id);
    if(!tokens.hasOwnProperty(token_id)) {
        err = {
            error: true,
            message: "Token does not exist"
        }
        callback(err, null);
    } else {
        callback(null, tokens[token_id]);
    }
}

//===============================================

function addService(service) {
    services[service.identifier] = {
        first_contact: Date.now(),
        latest_contact: Date.now(),
        details: service
    };
}

function addContact(identifier) {
    services[identifier].latest_contact = Date.now();
}

function addToken(token_id) {
    tokens[token_id] = [];
}

function constructUrl(service, token_id) {
    var url = "http://" + service.details.service_ip + ":" + service.details.service_port + '/api/killToken' + "?tokenId=" + token_id;
    logger.info("Token invalidation URL for service", service.details.identifier, ": ", url);
    return url;
}

function invalidateService(url) {
    request.get(url, function(err, response, body) {
        if(err) {
            logger.error(err);
        } else {
            if(response.statusCode == '200') {
                logger.info("Invalidation successful", body);
            } else logger.error("Invalidation failed with res", response.statusCode);
        }
    });

}

setInterval(function() {
    //console.log(tokens);
    //console.log(services);
}, 10000);