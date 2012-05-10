var async = require('async');
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');
var common = require('./common/common.js');

/**
 * 创建消息，消息发送给user_id
 */
exports.create_message = function (type, user_id, content, cb){
    var create_at = Util.format_date(new Date());
    mysql.insert('insert into message(type, user_id, content, create_at) values(?,?,?,?)', [ type, user_id, content, create_at ], function(err, info) {
        if (err) {
            log.error('create_message发送消息失败[' + type + ',' + user_id + ',' + content + ']');
            if(cb && typeof cb == 'function')
                cb(false);
        }
        if(cb && typeof cb == 'function')
            cb(true);
    });
};

/**
 * 批量创建消息，消息发送给user_id的所有好友
 */
exports.batch_create_message = function (type, user_id, content, cb){
    var create_at = Util.format_date(new Date());
    common.get_all_followers(user_id, function(err, users){
        async.forEach(users, function(user, callback) {
            mysql.insert('insert into message(type, user_id, content, create_at) values(?,?,?,?)', [ type, user.id, content, create_at ], function(err, info) {
                if (err) {
                    log.error('batch_create_message发送消息失败[' + type + ',' +  user.id + ',' + content + ']');
                }
                callback();
            });
        }, function(err) {
            cb(err);
        });
    });  
};

/**
 * 查看所有消息
 */
exports.view_messages = function (req, res, next){
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '未登录用户不能查看消息'
        });
        return;
    }
    
    var user_id = req.session.user.id;
  
    async.auto({
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
            hasread_messages:results.hasread_messages
        });
        return;
    });
    
   
};

/**
 * 未读消息数
 */
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

/**
 * 标记所有消息为已读
 */
exports.mark_all_read = function(req, res, next){
    var user_id = req.session.user.id;
    mysql.query('update message set is_read = ? where user_id = ?',[1, user_id], function(err, result) {
        res.redirect('/messages');
        return;
    });
};