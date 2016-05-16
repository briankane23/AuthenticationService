/*
 Controller for the user model.

 Implements:
 - User Model (app/models/user.server.model.js)
 */

var User = require('mongoose').model('User'),
    logger = require('winston'),
    passport = require('passport'),
    token = require('./token.server.controller.js'),
    serviceList = require('./services.server.controller.js');

logger.info("Initialising Authentication Controller");

exports.authenticate = function(req, res) {
    if(req.user) {
        logger.info("Authentication successful for user:", req.user.username);
        token.createToken(req.user, req.ip, function(err, token) {
            if(!err) { res.json(token); } else res.status(400).send();
        });
    } else res.status(401).send();
};

exports.validate = function(req, res) {
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
                serviceList.addTokenToService(req.body.service, token_id);
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
