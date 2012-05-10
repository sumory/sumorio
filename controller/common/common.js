var crypto = require('crypto');
var async = require('async');
var mysql = require('../../lib/mysql.js');
var log = require('../../lib/log.js');

/**
 * 加密函数
 * 
 * @param str 源串
 * @param secret  因子
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
 * 查看关注的所有人
 */
exports.get_all_followings = function(user_id, callback) {
    mysql.query('select * from user where id in(select following_id from follow where user_id = ?)', [ user_id ], function(err, users) {
        callback(err, users);
    });
};

/**
 * 查看所有粉丝
 */
exports.get_all_followers = function(user_id, callback) {
    mysql.query('select * from user where id in(select user_id from follow where following_id = ?)', [ user_id ], function(err, users) {
        callback(err, users);
    });
};

/**
 * 得到所有文件夹
 */
exports.get_all_folders = function(user_id, callback) {
    mysql.query('select * from folder where user_id = ? order by sequence asc', [ user_id ], function(err, folders) {
        if (err) {
            callback(err, []);
        }
        callback(err, folders);
    });
};

/**
 * 查看用户, 用于生成profile的sidebar
 */
exports.get_user = function(req, res, next) {
    var user_id = req.params.user_id;
    async.parallel({
        following_count : function(cb) {// 关注
            mysql.queryOne("select count(following_id) as count from follow where user_id = ?", [ user_id ], function(err, count) {
                if (err || !count) {
                    cb(null, {
                        count : 0
                    });
                }
                else
                    cb(null, count);
            });
        },
        follower_count : function(cb) {// 粉丝
            mysql.queryOne("select count(user_id) as count from follow where following_id = ?", [ user_id ], function(err, count) {
                if (err || !count) {
                    cb(null, {
                        count : 0
                    });
                }
                else
                    cb(null, count);
            });
        },
        user : function(cb) {
            mysql.queryOne("select * from user where id = ?", [ user_id ], function(err, user) {
                if (err || !user) {
                    cb(null, undefined);
                }
                else {
                    if (req.session.user && req.session.user.id == user_id) {
                        user.isCurrent = true;
                    }
                    else
                        user.isCurrent = false;
                    cb(null, user);
                }

            });
        },
    }, function(err, result) {
        res.json({
            user : result.user,
            following_count : result.following_count.count,
            follower_count : result.follower_count.count
        });
        return;
    });
};

/**
 * 查看文件夹
 */
exports.get_folders = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({folders : []});
        return;
    }
    
    var user_id = req.session.user.id;
    
    mysql.query('select * from folder where user_id = ? order by sequence asc', [ user_id ], function(err, folders) {
        if (err) {
            res.json({
                folders : []
            });
            return;
        }
        var folder_ids = Array.prototype.map.call(folders, function(item) {
            return item.id;
        });
        if (folder_ids && folder_ids.length > 0) {
            mysql.query('select count(id) as count, folder_id from file where folder_id in(' + folder_ids.join(',') + ') group by folder_id', [], function(err, kvs) {
                for ( var j = 0; j < folders.length; j++) {
                    for ( var i = 0; i < kvs.length; i++) {
                        if (folders[j].id == kvs[i].folder_id)
                            folders[j].file_count = kvs[i].count;
                    }
                }
                res.json({
                    folders : folders
                });
                return;
            });
        }
        else {
            res.json({
                folders : []
            });
            return;
        }
    });
};

/**
 * 查看用户的文章分类
 */
exports.get_categories = function(req, res, next) {
    var user_id = req.params.user_id;
    mysql.query('select * from category where user_id = ? order by sequence asc', [ user_id ], function(err, categories) {
        if (err) {
            res.json({
                categories : []
            });
            return;
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
                res.json({
                    categories : categories
                });
                return;
            });
        }
        else {
            res.json({
                categories : []
            });
            return;
        }
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
    'share_file' : 6,
};
