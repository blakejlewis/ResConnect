// server.js

	// get all the tools we need
	var express  = require('express');
	var session  = require('express-session');
	var favicon = require('express-favicon');
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
	var morgan = require('morgan');

	var upload = require('express-fileupload');
	var app      = express();
	var port     = process.env.PORT || 1848;

	var passport = require('passport');
	var flash    = require('connect-flash');


	require('./config/passport')(passport); // pass passport for configuration
	
	app.use('/public', express.static('public'));

	// set up our express application
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());

	app.set('view engine', 'ejs'); // set up ejs for templating
	app.use(upload());

	// required for passport
	app.use(session({
		secret: 'vidyapathaisalwaysrunning',
		resave: true,
		saveUninitialized: true
	 } )); // session secret

	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session


	require('./app/routes.js')(app, passport); 

	app.listen(port);
	console.log('Server running on port ' + port);
