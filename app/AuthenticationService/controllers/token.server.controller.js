var User = require('mongoose').model('User'),
    logger = require('winston'),
    passport = require('passport'),
    generator = require('rand-token');

var tokens = {};
var userAssignments = {};

exports.createToken = function(user, ip, callback) {
    logger.info("Creating token for user:", user.username);
    var token_id = generator.generate(32);
    addToken(token_id, user, ip, function(err, token_id) {
        callback(err, token_id);
    });
};

exports.validateToken = function(token_id, ip_address, callback) {
    if(tokens.hasOwnProperty(token_id)) {
        token = tokens[token_id];
        if(Date.now > token.valid_to) {
            err = {
                error: true,
                message: "Token is out of date"
            }
            callback(err, null);
        }
        else if(token.ip_address !== ip_address) {
            if(token.ip_address != '::1') {
                logger.error("IP Mismatch:", token.ip_address, ip_address);
                err = {
                    error: true,
                    message: "IP Address does not match"
                }
                callback(err, null);
            } else {
                logger.info("Local test detected, letting IP mismatch slide.."); //TODO - sort this out!
                callback(null, token);
            }
        }
        else {
            callback(null, token);
        }
    } else {
        err = {
            error: true,
            message: "Token does not exist"
        }
        callback(err, null);
    }
}

exports.invalidateToken = function(token_id, callback) {
    invalidateToken(token_id, function(err) {
        callback(err);
    });
}

//======================================

function addToken(token_id, user, ip_address, callback) {
    invalidateUserTokens(user);
    logger.info("Assigning token", token_id, "to user", user.username, "with IP", ip_address);
    token = {
        token_id: token_id,
        valid_from: Date.now(),
        valid_to: Date.now() + 900000,
        ip_address: ip_address,
        username: user.username
    }

    tokens[token_id] = token;
    userAssignments[user.username] = token_id;
    callback(null, token);
};

function invalidateUserTokens(user) {
    console.log(user.username, Object.keys(userAssignments));
    if(userAssignments.hasOwnProperty(user.username)) {
        logger.info("Invalidating existing user token for user", user.username);
        token_id = userAssignments[user.username];
        invalidateToken(token_id, function(err) {
            if(err) {
                logger.error("Failed to invalidation token");
            }
        });
    };
}

function invalidateToken(token_id, callback) {
    logger.info("Invalidating token:", token_id);
    if(typeof tokens != 'undefined') {
        if(tokens.hasOwnProperty(token_id)) {
            username = tokens[token_id].username;
            delete(tokens[token_id]);
            if(typeof userAssignments != 'undefined') {
                delete(userAssignments[username]);
                callback(null);
            } else callback("Token not assigned to user");
        } else callback("Token does not exist");
    } else callback("Tokens variable unset");
}

setInterval(function() {
    console.log("", Object.keys(tokens).length, "tokens currently assigned");
}, 100000);

setInterval(function() {
    var now = Date.now();
    Object.keys(tokens).forEach(function(key) {
        if(tokens[key].valid_to < now) {
            invalidateToken(key, function(err) {
                if(err) {
                    log.error("Failed to invalidate token", key);
                }
            });
        }
    });
}, 30000);