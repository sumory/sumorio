var async = require('async');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');
var log = require('../lib/log.js');
var common = require('./common.js');

/**
 * 加关注
 */
exports.follow = function(req, res, next) {
    if (!req.session.user) {
        res.json(JSON.parse('{"flag":"fail","info":"未登录用户不能关注他人"}'));
        return;
    }

    var to_follow_id = req.params.to_follow_id;
    var create_at = Util.format_date(new Date());
    mysql.update('insert into follow(user_id, following_id, create_at) values(?,?,?)', [ req.session.user.id, to_follow_id, create_at ], function(err, info) {
        if (err) {
            log.error(err);
            res.json(JSON.parse('{"flag":"fail","info":"关注用户发生错误"}'));
            return;
        }
        else {
            res.json(JSON.parse('{"flag":"success"}'));
            return;
        }
    });
};

/**
 * 取消关注
 */
exports.unfollow = function(req, res, next) {
    if (!req.session.user) {
        res.json(JSON.parse('{"flag":"fail","info":"未登录用户不能取消关注"}'));
        return;
    }

    var to_unfollow_id = req.params.to_unfollow_id;
    mysql.update('delete from follow where user_id =? and following_id = ?', [ req.session.user.id, to_unfollow_id ], function(err, info) {
        if (err) {
            log.error(err);
            res.json(JSON.parse('{"flag":"fail","info":"取消关注发生错误"}'));
            return;
        }
        else {
            res.json(JSON.parse('{"flag":"success"}'));
            return;
        }
    });
};

/**
 * 是否已关注
 */
exports.isfollow = function(req, res, next) {
    if (!req.session.user) {
        res.json(JSON.parse('{"flag":"fail"}'));
        return;
    }

    var user_id = req.params.user_id;
    mysql.queryOne('select * from follow where user_id =? and following_id = ?', [ req.session.user.id, user_id ], function(err, follow) {
        if (err) {
            log.error(err);
            res.json(JSON.parse('{"flag":"fail"}'));
            return;
        }
        else if (follow && follow.user_id) {
            res.json(JSON.parse('{"flag":"success"}'));
            return;
        }
        else {
            res.json(JSON.parse('{"flag":"fail"}'));
            return;
        }
    });
};

/**
 * 查看所有关注
 */
exports.view_followings = function(req, res, next) {
    var user_id = req.params.user_id;

    mysql.update('select * from user where id in(select following_id from follow where user_id = ?)', [ user_id ], function(err, users) {
        mysql.query('select count(id) as count, author_id from archive group by author_id', function(err, result) {
            for ( var i = 0; i < users.length; i++) {
                for ( var j = 0; j < result.length; j++) {
                    if (users[i].id == result[j].author_id) {
                        users[i].archive_count = result[j].count;
                        break;
                    }
                }
            }
            
            common.initSidebar(user_id, function(err, result) {
                if (err) {
                    res.render('notify/notify', {
                        error : '查找用户信息出错'
                    });
                    return;
                }
                
                if(!(result.user)){//查不到user
                    res.render('notify/notify', {
                        error : '查找用户信息出错'
                    });
                    return;
                }
                res.render('user/person', {
                    users : users,
                    result : result,
                    title : '关注人'
                });
                return;
            });
            
            
        });
    });
};

/**
 * 查看所有粉丝
 */
exports.view_followers = function(req, res, next) {
    var user_id = req.params.user_id;

    mysql.update('select * from user where id in(select user_id from follow where following_id = ?)', [ user_id ], function(err, users) {   
        mysql.query('select count(id) as count, author_id from archive group by author_id', function(err, result) {
            for ( var i = 0; i < users.length; i++) {
                for ( var j = 0; j < result.length; j++) {
                    if (users[i].id == result[j].author_id) {
                        users[i].archive_count = result[j].count;
                        break;
                    }
                }
            }
           
            common.initSidebar(user_id, function(err, result) {
                if (err) {
                    res.render('notify/notify', {
                        error : '查找用户信息出错'
                    });
                    return;
                }
                
                if(!(result.user)){//查不到user
                    res.render('notify/notify', {
                        error : '查找用户信息出错'
                    });
                    return;
                }
                res.render('user/person', {
                    users : users,
                    result : result,
                    title : '粉丝'
                });
                return;
            });
            
            
        });
    });
};
