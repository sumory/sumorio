var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

/**
 * 根据文章id查询文章的评论信息
 */
exports.queryRepliesOfArticle = function(articleId, callback) {
    mysql.query('select * from reply where article_id = ?', [ articleId ], function(err, replies) {
        callback(err, replies);
    });
};

/**
 * 根据文章id删除所有评论信息
 */
exports.deleteRepliesOfArticle = function(articleId, callback){
    mysql.update('delete from reply where article_id = ?', [ articleId], function(err, info) {
        callback(err, info);
    });
};

/**
 * 创建回复
 */
exports.saveReply = function(content, userId, articleId, createAt, callback){
    mysql.update('insert into reply(content,author_id,article_id,create_at,update_at) values(?,?,?,?,?)',[content, userId, articleId, createAt, createAt], function(err, info){
        callback(err, info);
    });
};

/**
 * 删除回复
 */
exports.deleteReply = function(userId, replyId, callback){
    mysql.update('delete from reply where id = ? and author_id = ?',[ replyId, userId], function(err, info){
        callback(err, info);
    });
};


