var express = require('express');
var route = require('./route.js');
var config = require('./config.js').config;

var app = express.createServer();
var static_dir = __dirname + '/public';

app.configure(function() {
    app.set('view engine', 'html');
    app.set('views', __dirname + '/view');
    app.register('.html', require('ejs'));
    app.use(express.bodyParser({
        uploadDir : config.tmp_upload_path//express的临时上传路径
    }));
    app.use(express.cookieParser());
    app.use(express.session({
        secret : config.session_secret,
    }));
    app.use(require('./controller/sign.js').auth_user);// custom middleware
    
    var csrf = express.csrf();
    app.use(function(req, res, next) {
        if (req.body && req.method.toLowerCase() === 'post')// 一些ajax的post操作未加csrf，所以这里先放过
            return next();
        if (req.body && req.body.user_action === 'upload_image')// 含有name=‘user_action' value='upload_image'的请求放过
            return next();
        csrf(req, res, next);
    });
});

app.helpers({
    config : config
});

app.dynamicHelpers({
    csrf : function(req, res) {
        return req.session ? req.session._csrf : '';
    }
});

app.configure('development', function() {
    app.use(express.static(static_dir));
    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack : true
    }));
});

app.configure('production', function() {
    var one_year = 1000 * 60 * 60 * 24 * 30;
    app.use(express.static(static_dir, {
        maxAge : one_year
    }));
    app.use(express.errorHandler());
    app.set('view cache', true);
});

route(app);// route

app.listen(config.app_port);
console.log("Sumorio is listening on port %d in %s mode", app.address().port, app.settings.env);
