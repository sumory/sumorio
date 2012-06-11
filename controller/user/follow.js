var async = require('async');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var Util = require('../../lib/util.js');
var log = require('../../lib/log.js');
var common = require('../common/common.js');
var memssage_ctrl = require('../message/message.js');
var userDao = require('../../dao/user.js');
var followDao = require('../../dao/follow.js');

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
    followDao.saveFollow(req.session.user.id, to_follow_id, create_at, function(err, info) {
        if (err) {
            res.json(JSON.parse('{"flag":"fail","info":"关注用户发生错误"}'));
            return;
        }
        else {
            var mbody = {};
            mbody.from_user_id = req.session.user.id;
            mbody.from_user_name = req.session.user.loginname;
            memssage_ctrl.create_message(common.MessageType.follow, to_follow_id, JSON.stringify(mbody), function(){});
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
    followDao.deleteFollow( req.session.user.id, to_unfollow_id , function(err, info) {
        if (err) {
            res.json(JSON.parse('{"flag":"fail","info":"取消关注发生错误"}'));
            return;
        }
        else {
            var mbody = {};
            mbody.from_user_id = req.session.user.id;
            mbody.from_user_name = req.session.user.loginname;
            memssage_ctrl.create_message(common.MessageType.unfollow, to_unfollow_id, JSON.stringify(mbody), function(){});
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
    followDao.queryFollow(req.session.user.id, user_id, function(err, follow) {
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
    userDao.queryAllFollowings(user_id, function(err, users) {
        userDao.userCount(users, function(err, users){
            res.render('user/person', {
                user_id : user_id,
                users : users,
                title : '关注人'
            });
            return;
        });
    });
};

/**
 * 查看所有粉丝
 */
exports.view_followers = function(req, res, next) {
    var user_id = req.params.user_id;
    userDao.queryAllFollowers(user_id, function(err, users) {
        userDao.userCount(users, function(err, users){
            res.render('user/person', {
                user_id : user_id,
                users : users,
                title : '粉丝'
            });
            return;
        });
    });
};
