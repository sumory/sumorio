var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

/**
 * 保存信息
 */
exports.saveMessage = function(type, userId, content, createAt, callback){
    mysql.update('insert into message(type, user_id, content, create_at) values(?,?,?,?)', [ type, userId, content, createAt ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 得到用户收到的消息：已读或未读,isRead=1已读;=0未读
 */
exports.queryMessagesOfUser = function(userId, isRead, callback){
    mysql.query('select  id, type, user_id, content, DATE_FORMAT(create_at,"%Y-%m-%d %H:%i:%s") as create_at  from message where user_id = ? and is_read = ? order by create_at desc', [ userId, isRead ], function(err, messages){
        callback(err,messages);
    });
};

/**
 * 标记用户所有消息为已读
 */
exports.updateMessages = function(userId, callback){
    mysql.query('update message set is_read = ? where user_id = ?', [ 1, userId ], function(err, info) {
        callback(err, info);
    });
};