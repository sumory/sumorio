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
        user : function(cb) {
            mysql.queryOne("select * from user where id = ?", [ user_id ], function(err, user) {
                if (err) {
                    log.error('查询用户时发生异常');
                    cb(null, {});
                }
                if (!user) {
                    cb(null, {});
                }
                cb(null, user);
            });
        },
        categories : function(cb) {
            mysql.query('select * from category where user_id = ? order by sequence asc', [ user_id ], function(err, categories) {
                if (err) {
                    log.error('查询文章分类时发生异常');
                    cb(null, []);
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
                    cb(null, []);
            });
        },
    }, function(err, result) {// results is now equals to: {user: {...},categories: [{...},{...}]}
        callback(err, result);
    });
};
