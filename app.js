var express = require('express');
var routes = require('./route');
var config = require('./config.js').config;

var app = express.createServer();

var static_dir = __dirname + '/public';

app.configure(function() {
    app.set('view engine', 'html');
    app.set('views', __dirname + '/view');
    app.register('.html', require('ejs'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret : config.session_secret,
    }));
    // custom middleware
    app.use(routes.auth_user);
    app.use(express.csrf());
});

// set static,dynamic helpers
app.helpers({
    config : config
});
app.dynamicHelpers({
    csrf : function(req, res) {
        return req.session ? req.session._csrf : '';
    },
});

app.configure('development', function() {
    app.use(express.static(static_dir));
    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack : true
    }));
});

app.configure('production', function() {
    var one_year = 1000 * 60 * 60 * 24 * 365;
    app.use(express.static(static_dir, {
        maxAge : one_year
    }));
    app.use(express.errorHandler());
    app.set('view cache', true);
});

// routes
app.get('/', routes.site_index);

// 注册登录相关
app.get('/signup', routes.signup);
app.get('/signin', routes.signin);
app.get('/signout', routes.signout);
app.post('/signup', routes.signup);
app.post('/signin', routes.signin);

// 文章分类相关
app.get('/categories/edit', routes.edit_categories);
app.get('/category/:category_id/edit', routes.edit_category);
app.post('/category/:category_id/modify', routes.modify_category);
app.post('/category/add', routes.add_category);
app.get('/category/:category_id/delete', routes.delete_category);

// 用户相关
app.get('/user/:id', routes.user_index);
app.get('/users', routes.users);

// 文章相关
app.get('/archive/create', routes.create_archive);
app.post('/archive/create', routes.create_archive);
app.get('/archive/:archive_id/edit', routes.edit_archive);
app.post('/archive/:archive_id/modify', routes.modify_archive);
app.get('/archive/:archive_id/delete', routes.delete_archive);
app.get('/archives/:user_id/:category_id', routes.view_archives);
app.get('/:user_id/archives', routes.view_user_archives);
app.get('/archive/:archive_id', routes.view_archive);


//reply
app.post('/:archive_id/reply', routes.create_reply);
app.post('/:archive_id/reply2', routes.create_reply2);
app.post('/reply/:reply_id/delete', routes.delete_reply);

//上传图片
app.post('/upload/image', routes.upload_image);

//导航相关
app.post('/nav/all', routes.all_navs);


//follow相关
app.post('/follow/:to_follow_id', routes.follow);
app.post('/unfollow/:to_unfollow_id', routes.unfollow);
app.post('/isfollow/:user_id', routes.isfollow);
app.get('/:user_id/following', routes.view_followings);
app.get('/:user_id/follower', routes.view_followers);

app.listen(config.app_port);
console.log("Sumorio is listening on port %d in %s mode", app.address().port, app.settings.env);
