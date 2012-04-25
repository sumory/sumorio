var crypto = require('crypto');
var async = require('async');
var mysql = require('../lib/mysql.js');
var log = require('../lib/log.js');

/**
 * 加密函数
 * 
 * @param str
 *            源串
 * @param secret
 *            因子
 * @returns
 */
exports.encrypt = function encrypt(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

/**
 * 解密
 * 
 * @param str
 * @param secret
 * @returns
 */
exports.decrypt = function decrypt(str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

/**
 * md5 hash
 * 
 * @param str
 * @returns
 */
exports.md5 = function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

/**
 * 获取渲染用户首页左侧bar的数据
 * 
 * @param user_id
 *            用户id
 * @param callback
 *            回调
 */
exports.initSidebar = function initSidebar(user_id, callback) {

    async.parallel({// 并行执行
        followings : function(cb) {//关注
            mysql.queryOne("select count(following_id) as count from follow where user_id = ?", [ user_id ], function(err, count) {
                if (err) {
                    log.error('查询用户关注数发生异常');
                    cb(null, {count:0});
                }
                else if (!count) {
                    cb(null, {count:0});
                }
                else
                    cb(null, count);
            });
        },
        followers : function(cb) {//粉丝
            mysql.queryOne("select count(user_id) as count from follow where following_id = ?", [ user_id ], function(err, count) {              
                if (err) {
                    log.error('查询用户粉丝数发生异常');
                    cb(null, {count:0});
                }
                else if (count == null) {
                    cb(null, {count:0});
                }
                else
                    cb(null, count);
            });
        },
        user : function(cb) {
            mysql.queryOne("select * from user where id = ?", [ user_id ], function(err, user) {
                if (err) {
                    log.error('查询用户时发生异常');
                    cb(null, undefined);
                }
                if (!user) {
                    cb(null, undefined);
                }
                cb(null, user);
            });
        },
        categories : function(cb) {
            mysql.query('select * from category where user_id = ? order by sequence asc', [ user_id ], function(err, categories) {
                if (err) {
                    log.error('查询文章分类时发生异常');
                    cb(null, undefined);
                }
                var category_ids = Array.prototype.map.call(categories, function(item) {
                    return item.id;
                });
                if (category_ids && category_ids.length > 0) {
                    mysql.query('select category_id,count(archive_id) as count from archive_category where category_id in(' + category_ids.join(',') + ') group by category_id', [], function(err, kvs) {
                        for ( var j = 0; j < categories.length; j++) {
                            for ( var i = 0; i < kvs.length; i++) {
                                if (categories[j].id == kvs[i].category_id)
                                    categories[j].archive_count = kvs[i].count;
                            }
                        }
                        cb(null, categories);
                    });
                }
                else
                    cb(null, undefined);
            });
        },
    }, function(err, result) {// results is now equals to: {user: {...},categories: [{...},{...}]}
        //console.log(result);
        callback(err, result);
    });
};

/**
 * 查看关注的所有人
 */
exports.get_all_followings = function(user_id, callback) {
    mysql.update('select * from user where id in(select following_id from follow where user_id = ?)', [ user_id ], function(err, users) {
       callback(err, users);
    });
};

/**
 * 查看所有粉丝
 */
exports.get_all_followers = function(user_id, callback) {
   mysql.update('select * from user where id in(select user_id from follow where following_id = ?)', [ user_id ], function(err, users) {   
       callback(err, users);
    });
};

/**
 * 消息类型
 */
exports.MessageType = {
        'create_archive' : 1,
        'update_archive' : 2,
        'reply' : 3,
        'follow' : 4,
        'unfollow' : 5,
};
