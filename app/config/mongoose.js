/*
	Main configuration file for the moongoose module

	Implements:
		-Main Config file (config/config.js)	

	Implemented By: 
		-Server (server.js)
*/

var config = require('./config'),
	mongoose = require('mongoose');

module.exports = function() {
	//configure based on settings in config file
	var db = mongoose.connect(config.db);

	//import the required models
	require('../AuthenticationService/models/user.server.model');

	return db;
};
	
