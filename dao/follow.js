var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

/**
 * 保存follow关系
 */
exports.saveFollow = function(userId, toFollowId, createAt, callback){
    mysql.update('insert into follow(user_id, following_id, create_at) values(?,?,?)', [ userId, toFollowId, createAt ], function(err, info) {
        callback(err, info);
    });
};


/**
 * 删除follow关系
 */
exports.deleteFollow = function(userId, toFollowId, callback){
    mysql.update('delete from follow where user_id =? and following_id = ?', [ userId, toFollowId ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 查找follow关系
 */
exports.queryFollow = function(userId, followId, callback){
    mysql.queryOne('select * from follow where user_id =? and following_id = ?', [ userId, followId ], function(err, follow) {
        callback(err, follow);
    });
};

/**
 * 查询关注数
 */
exports.queryFollowingCount = function(userId, callback){
    mysql.queryOne("select count(following_id) as count from follow where user_id = ?", [ userId ], function(err, count) {
        callback(err, count);
    });
};


/**
 * 查询粉丝数
 */
exports.queryFollowerCount = function(userId, callback){
    mysql.queryOne("select count(user_id) as count from follow where following_id = ?", [ userId ], function(err, count) {
        callback(err, count);
    });
};