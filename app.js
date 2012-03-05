var express = require('express');
var routes = require('./route');
var	config = require('./config.js').config;

var app = express.createServer();

var static_dir = __dirname+'/public';

app.configure(function(){
	app.set('view engine', 'html');
	app.set('views', __dirname + '/view');
	app.register('.html',require('ejs'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret:config.session_secret,
	}));
	// custom middleware
	app.use(routes.auth_user);
	app.use(express.csrf());
});

//set static,dynamic helpers
app.helpers({
	config:config
});
app.dynamicHelpers({
	csrf: function(req,res){
		return req.session ? req.session._csrf : '';
	},
});

app.configure('development', function(){
	app.use(express.static(static_dir));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	var one_year=1000*60*60*24*365;
	app.use(express.static(static_dir,{maxAge:one_year}));
	app.use(express.errorHandler()); 
	app.set('view cache',true);
});

// routes
app.get('/', routes.site_index);
app.get('/user/:id', routes.user_index);

app.listen(config.app_port);
console.log("Sumorio listening on port %d in %s mode", app.address().port, app.settings.env);
