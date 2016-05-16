var logger = require('winston'),
    request = require('request');

var services = {};
var tokens = {};

exports.addTokenToService = function(service, token_id) {
    logger.info("Adding record for service", service.identifier, "to token", token_id);
    if(!services.hasOwnProperty(service.identifier)) {
        addService(service);
    } else {
        addContact(service.identifer);
    }

    if(!tokens.hasOwnProperty(token_id)) {
        addToken(token_id);
    }

    tokens[token_id].unshift(service);
}

exports.invalidateServices = function(token_id) {
    logger.info("Attempting to invalidate existing accesses across services for token", token_id);
    tokens[token_id].forEach(function(service) {
        logger.info("Invalidating token", token_id, "on service", service.identifier);
        var url = constructUrl(service);
        try {
            invalidateService(url);
        } catch (ex) {
            logger.info("Failed to issue HTTP request to service", service.identifier);
        }
    });
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

function constructUrl(service) {
    var url = "http://" + service.service_ip + ":" + service.service_port + '/api/invalidate';
    logger.info("Token invalidation URL for service", service.identifier, ": ", url);
    return url;
}

function invalidateService(url) {
    request.get(url)
        .on('response', function(response) {
            logger.info("Invalidation successful", response);
        })
        .on('error', function(err) {
            logger.info("Failed to invalidate", err);
        });

}

setInterval(function() {
    //console.log(tokens);
    //console.log(services);
}, 10000);