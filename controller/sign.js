var check = require('validator').check;
var sanitize = require('validator').sanitize;
var config = require('../config.js').config;
var userDao = require('../dao/user.js');
var Util = require('../lib/util.js');

/**
 * 注册
 */
exports.signup = function(req, res, next) {
    var method = req.method.toLowerCase();
    if (method == 'get') {
        res.render('sign/signup');
        return;
    }
    if (method == 'post') {
        var name = sanitize(req.body.name).trim();
        name = sanitize(name).xss();
        var loginname = name.toLowerCase();
        var pass = sanitize(req.body.pass).trim();
        pass = sanitize(pass).xss();
        var email = sanitize(req.body.email).trim();
        email = email.toLowerCase();
        email = sanitize(email).xss();
        var re_pass = sanitize(req.body.re_pass).trim();
        re_pass = sanitize(re_pass).xss();

        if (name == '' || pass == '' || re_pass == '' || email == '') {
            res.render('sign/signup', {
                error : '信息不完整。',
                name : name,
                email : email
            });
            return;
        }

        if (name.length < 5) {
            res.render('sign/signup', {
                error : '用户名至少需要5个字符。',
                name : name,
                email : email
            });
            return;
        }

        try {
            check(name, '用户名只能使用0-9，a-z，A-Z。').isAlphanumeric();
        }
        catch (e) {
            res.render('sign/signup', {
                error : e.message,
                name : name,
                email : email
            });
            return;
        }

        if (pass != re_pass) {
            res.render('sign/signup', {
                error : '两次密码输入不一致。',
                name : name,
                email : email
            });
            return;
        }

        try {
            check(email, '不正确的电子邮箱。').isEmail();
        }
        catch (e) {
            res.render('sign/signup', {
                error : e.message,
                name : name,
                email : email
            });
            return;
        }

        userDao.queryUsersByEmailOrLoginName(loginname, email, function(err, users) {
            if (err)
                return next(err);
            if (users.length > 0) {
                res.render('sign/signup', {
                    error : '用户名或邮箱已被使用。',
                    name : name,
                    email : email
                });
                return;
            }
            pass = Util.md5(pass);// md5 the pass
            // create gavatar
            var avatar_url = '/user_data/avatar/avatar.png';//'http://www.gravatar.com/avatar/' + Util.md5(email) + '?size=48';网速问题，初始化头像时不再支持gravatar
            userDao.saveUser(loginname, email, pass, new Date(), avatar_url, function(err, info) {
                if (err)
                    return next(err);
                res.render('sign/signup', {
                    success : '欢迎加入 ' + config.name + '!'
                });
                return;
            });
        });
    }
};

/**
 * 登录
 */
exports.signin = function(req, res, next) {
    var method = req.method.toLowerCase();
    if (method == 'get') {
        res.render('sign/signin');
        return;
    }
    if (method == 'post') {
        var name = sanitize(req.body.name).trim();
        var loginname = name.toLowerCase();
        var pass = sanitize(req.body.pass).trim();
        if (name == '' || pass == '') {
            res.render('sign/signin', {
                error : '信息不完整。'
            });
            return;
        }
        userDao.queryUserByLoginName(loginname, function(err, user) {
            if (err)
                return next(err);
            if (!user) {
                res.render('sign/signin', {
                    error : '这个用户不存在。'
                });
                return;
            }

            pass = Util.md5(pass);
            if (pass != user.pwd) {
                res.render('sign/signin', {
                    error : '密码错误。'
                });
                return;
            }

            gen_session(user, res);// store session cookie
            res.redirect('home');
        });
    }
};

/**
 * 退出系统
 */
exports.signout = function(req, res, next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, {
        path : '/'
    });
    res.redirect('home');
};


function gen_session(user, res) {
    var auth_token = Util.encrypt(user.id + '\t' + user.loginname + '\t' + user.pwd + '\t' + user.email, config.session_secret);
    res.cookie(config.auth_cookie_name, auth_token, {
        path : '/',
        maxAge : 1000 * 60 * 60 * 24 * 7
    }); // cookie 有效期1周
}

/**
 * auth_user middleware
 */
exports.auth_user = function(req, res, next) {
    if (req.session.user) {
        res.local('current_user', req.session.user);
        return next();
    }
    else {
        var cookie = req.cookies[config.auth_cookie_name];
        if (!cookie)
            return next();

        var auth_token = Util.decrypt(cookie, config.session_secret);
        var auth = auth_token.split('\t');
        var user_id = auth[0];

        userDao.queryUser( user_id , function(err, user) {
            if (err)
                return next(err);
            if (user) {
                req.session.user = user;
                res.local('current_user', req.session.user);
                return next();
            }
            else
                return next();
        });
    }
};
