/*
	Main configuration file for the express end of the application.
	Bootstraps the server index router and server index controller.

	Implements: 
		-Express Module (lib)
		-Server Index Router (app/routes/index.server.routes.js)

	Implemented By:
		-Server (server.js)
*/

// Dependencies
var config = require('./config'),
	express = require('express'),
	morgan = require('morgan'),
	compress = require('compression'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	expressSession = require('express-session'),
	passport = require('passport'),
	flash = require('connect-flash');

module.exports = function() {
	var app = express();
	
	//set logging and compression middleware based on environment
	if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}

	//set other required middlewares - always load
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(bodyParser.json());
	app.use(methodOverride('_method'));

	//set the express session - pull session secret from config file
	app.use(expressSession({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret
	}));

	app.set('views', './app/views');
	app.set('view engine', 'ejs');

	//set passport and flash modules to be used
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(express.static('public'));

	//get routing dependencies
	require('../AuthenticationService/routes/utils.server.routes.js')(app); //should always be first!
	require('../AuthenticationService/routes/authentication.server.routes.js')(app);
	
	return app;
};
