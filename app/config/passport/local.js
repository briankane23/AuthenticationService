/* 
	Basic local authentication strategy - will do the job but needs work!

	Implements: 
		- Passport & Passport Local modules
		- User Model (app/models/user.server.model.js)
*/

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User'),
	logger = require('winston');

module.exports = function() {
	passport.use(new LocalStrategy(function(username, password, done) {
		logger.info("Passport looking up user:", username);
		User.findOne({
			username: username
		}, function(err, user) {
			if(err) {
				console.log("Authentication failed:",err);
				return done(err);
			}

			if(!user) {
				return done(null, false, {
					message: "Unknown User - Try Again"
				});
			}

			if(!user.authenticate(password)) {
				return done(null, false, {
					message: "Invalid Password - Try Again"
				});
			}

			return done(null, user);
		});
	}));
};
