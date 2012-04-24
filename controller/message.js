var async = require('async');
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');
var common = require('./common.js');

exports.create_message = function (type, user_id, content, cb){
    var create_at = Util.format_date(new Date());
    mysql.insert('insert into message(type, user_id, content, create_at) values(?,?,?,?)', [ type, user_id, content, create_at ], function(err, info) {
        if (err) {
            log.error('发送消息失败[' + type + ',' + user_id + ',' + content + ']');
            if(cb && typeof cb == 'function')
                cb(false);
        }
        if(cb && typeof cb == 'function')
            cb(true);
    });
};

exports.view_messages = function (req, res, next){
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '未登录用户不能查看消息'
        });
        return;
    }
    
    var user_id = req.session.user.id;
  
    async.auto({
        user_profile : function(cb) {
            common.initSidebar(user_id, function(err, result) {
                if (err) {
                    log.error('查看消息时，查找用户信息错误');
                    cb(null, {});
                }
                if (!result || !result.user) {
                    log.error('查看消息时，查找不到用户');
                    cb(null, {});
                }
                cb(null, result);
            });
        },
        unread_messages : function(cb) {// 未读消息
            mysql.query('select id, type, user_id, content, DATE_FORMAT(create_at,"%Y-%m-%d %H:%i:%s") as create_at from message where user_id = ? and is_read = ? order by create_at desc', [ user_id, 0 ], function(err, unread_messages){
                if (err || !unread_messages) {
                    cb(null,[]);
                }
                cb(null,unread_messages);
            });
        },
        hasread_messages : function(cb) {// 已读消息
            mysql.query('select  id, type, user_id, content, DATE_FORMAT(create_at,"%Y-%m-%d %H:%i:%s") as create_at  from message where user_id = ? and is_read = ? order by create_at desc', [ user_id, 1 ], function(err, hasread_messages){
                if (err || !hasread_messages) {
                    cb(null,[]);
                }
                cb(null,hasread_messages);
            });
        }
    }, function(err, results) {
        if (err) {
            res.render('notify/notify', {
                error : '查询已读消息发生错误'
            });
            return;
        }

        res.render('message/index',{
            unread_messages:results.unread_messages,
            hasread_messages:results.hasread_messages,
            result:results.user_profile,
        });
        return;
    });
    
   
};

exports.unread_message_count = function (req, res, next){
    if (!req.session.user) {
        res.json({
            count : 0
        });
        return;
    }

    var user_id = req.session.user.id;
    mysql.query('select id from message where user_id = ? and is_read = 0',[user_id], function(err, result) {
        res.json({
            count : result.length
        });
        return;
    });
};

exports.mark_all_read = function(req, res, next){
    var user_id = req.session.user.id;
    mysql.query('update message set is_read = ? where user_id = ?',[1, user_id], function(err, result) {
        res.redirect('/messages');
        return;
    });
};