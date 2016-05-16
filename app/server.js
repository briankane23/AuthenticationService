/*
	Main server file. Starts server running on port 3000.
	Implements:
		- Express Configuration File (config/express.js)
		- Mongoose Configuration File (config/mongoose.js)
*/

//default the environment to dev unless set
process.env.NODE_ENV = process.env.NODE_ENV || 'development'; 

var mongoose = require('./config/mongoose'),
	express = require('./config/express'),
	logger = require('./config/logging');
	passport = require('./config/passport');

//set db, app and passport from configurations
var db = mongoose();
var app = express();
var passport = passport();


var port = 3300;
app.listen(port);
module.exports = app;

logger.info('Server running at http://localhost:' + port);
