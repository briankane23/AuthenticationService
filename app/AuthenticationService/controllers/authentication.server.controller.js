/*
 Controller for the user model.

 Implements:
 - User Model (app/models/user.server.model.js)
 */

var User = require('mongoose').model('User'),
    logger = require('winston'),
    passport = require('passport'),
    token = require('./token.server.controller.js'),
    serviceList = require('./services.server.controller.js'),
    serviceUtils = require('./utils.server.controller.js');

logger.info("Initialising Authentication Controller");

exports.authenticate = function(req, res) {
    /**
     *
     * @apiName Authenticate
     * @api {get} /api/authenticate
     * @param user Users unique ID
     * @param password Users password
     *
     * @apiDescription
     *      Authenticates the user to use API resources across services.
     *      The user supplies a username and password and if these are valid, is provided with a unique token.
     *      This token can be used across the service landscape for authentication.
     *      Login functionality is provided by Passport, which passes the user object into the request.
     *
     * @apiSuccess {String} token_id Unique Token for Accessing API resources.
     * @apiSuccess {Date} valid_from The initial time the token was generated.
     * @apiSuccess {Date} valid_to The time until which the token is valid.
     * @apiSuccess {ip_address} The IP address to which the token is referenced against. Checked on validation requests.
     * @apiSuccess {username} The username of the user to whom the token is provided.
     *
     * @apiError BadCredentials The login credentials supplied did not match a user.
     *
     * @apiExample {curl} Example Usage:
     *      curl http://localhost:3300/api/authenticate {
     *          "username": "user1",
     *          "password": "password123"
     *      }
     *
     * @apiSuccessExample {json} Success-Response
     *      HTTP/1.1 200 OK
     *      {
     *          "token_id": "hPEPye3ysijFfDA14Acjg2rm2YbRk2hW",
     *          "valid_from": 1463603338109,
     *          "valid_to": 1463604238109,
     *          "ip_address": "::1",
     *          "username": "briankane"
     *      }
     *
     * @apiPermission None
     *
     * @apiErrorExample Error-Response:
     *      HTTP/1.1 500 Server Error
     *      {
     *          "error": "BadCredentials"
     *      }
     *
     * @apiVersion 0.1.0
     */

    if(req.user) {
        logger.info("Authentication successful for user:", req.user.username);
        token.createToken(req.user, req.ip, function(err, token) {
            if(!err) { res.json(token); } else res.status(400).send();
        });
    } else res.status(401).send("InvalidLogin");
};

exports.validate = function(req, res) {
    /**
     *
     * @api {get} /api/validate
     * @apiName Validate Token
     * @param {String} identifer The unique identifier of the requesting service, e.g. event_1
     * @param {String} service_name The name of the requesting service, e.g. Event Service.
     * @param {String} service_ip The IP address of the requesting service, e.g. 111.111.11.11
     * @param {String} service_port The port number on which the requesting service is running.
     * @apiHeader {String} TokenId Unique access token
     *
     * @apiDescription
     *      Allows services to submit a tokenId and their context information in order to validate whether the provided token ID is valid for use.
     *      If valid for use, the requesting service is added to the list of services currently using the token ID.
     *
     * @apiSuccess {String} token_id Unique Token for Accessing API resources.
     * @apiSuccess {Date} valid_from The initial time the token was generated.
     * @apiSuccess {Date} valid_to The time until which the token is valid.
     * @apiSuccess {ip_address} The IP address to which the token was referenced against. Checked on validation requests.
     * @apiSuccess {username} The username of the user to whom the token was provided.
     *
     * @apiError NoToken No token was provided with the request.
     * @apiError NoServiceDetails No Service details were passed with the request.
     *
     * @apiErrorExample Error-Response
     *      HTTP/1.1 500 Server Error
     *      {
     *          "error": "NoToken"
     *      }
     *
     * @apiSuccessExample Success-Response
     *      HTTP/1.1 200 OK
     *      {
     *          "token_id": "cUp7Jea8WgKXJcpz5uekZRJURBEfDduF",
     *          "valid_from": 1463604546089,
     *          "valid_to": 1463605446089,
     *          "ip_address": "::1",
     *          "username": "briankane"
     *      }
     *
     * @apiPermission TokenRequired
     *
     * @apiVersion 0.1.0
     *
     */

    if(!req.query.tokenId) {
        var err = new Error("No token provided");
        process.nextTick(function() {
            res.status(500).send({
                error: true,
                message: "No token provided!"
            });
        });
    } else if(!req.body.service) {
        var err = new Error("No token provided");
        process.nextTick(function() {
            res.status(500).send({
                error: true,
                message: "No service details provided!"
            });
        });
    } else {
        logger.info("Validation request received for token", req.query.tokenId);
        token_id = req.query.tokenId;
        token.validateToken(token_id, req.ip, function(err, token) {
            if(err) {
                res.status(500).send(err);
            } else {
                serviceList.addServiceToToken(req.body.service, token_id);
                res.json(token);
            }
        });
    }
}

exports.unauthenticate = function(req, res) {
    var token_id = req.query.tokenId;
    if(!token_id) {
        res.status(500).send({
            error: true,
            message: "No token provided"
        });
    } else {
        token.invalidateToken(token_id, function(err){
            if(err) res.status(500).send(err);
            serviceList.invalidateServices(token_id);
            res.json({
                success: true
            });
        });
    }
}

exports.servicesByToken = function(req, res) {
    token_id = req.query.tokenId;
    serviceList.getServicesByToken(token_id, function(err, services) {
        if(err) {
            res.status(500).send(err);
        } else res.json(services);
    });
};

//create a new user
exports.create = function(req, res, next) {
    var user = new User(req.body);

    user.save(function(err) {
        if(err) {
            console.log("Issue Saving User:", err);
            return next(err);
        } else {
            console.log("User saved successfully:", user);
            res.json(user);
        }
    });
};

//return a list of all users
exports.list = function(req, res, next) {
    User.find({}, function(err, users) {
        if(err) {
            console.log("Unable to retrieve users", err);
            return next(err);
        } else {
            console.log("User list retrieved", users);
            res.json(users);
        }
    });
};

//return a single user
exports.read = function(req, res) {
    console.log("Identified",req.user._id);
    res.json(req.user);
};

//get a single user by id
exports.userById = function(req, res, next, id) {
    User.findOne({
        _id: id
    }, function(err, user) {
        if(err) {
            console.log("Couldn't retrieve user",id);
            return next(err);
        } else {
            console.log("Retrieved user",id);
            req.user = user;
            next();
        }
    });
};

//update a user by id
exports.update = function(req, res, next) {
    User.findByIdAndUpdate(req.user.id, req.body, function(err, user) {
        if(err) {
            console.log("Failed to update user",req.user.id,":",err);
            return next(err);
        } else {
            console.log("Updated user",req.user.id,":",user);
            res.json(user);
        }
    });
};

exports.delete = function(req, res, next) {
    req.user.remove(function(err) {
        if(err) {
            console.log("Failed to delete",req.user.id,":",err);
            return next(err);
        } else {
            console.log("Deleted",req.user.id,":",req.user);
            res.json(req.user);
        }
    });
};

exports.renderSignin = function(req, res, next) {
    if(!res.user) {
        res.render('signin', {
            title: 'Sign-in Form',
            messages: req.flash('error') || req.flash('info')
        });
    } else {
        return res.redirect('/');
    }
};

exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};
