var async = require('async');
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

/**
 * 通过ID获取某一用户
 */
exports.queryUser = function(userId, callback) {
    mysql.queryOne("select * from user where id = ?", [ userId ], function(err, user) {
        callback(err, user);
    });
};

/**
 * 通过ids批量查询用户
 */
exports.queryUsers = function(userIds, callback){
    mysql.query('select * from user where id in ('+userIds.join(',')+')',function(err, users){
        callback(err, users);
    });
};

/**
 * 查询所有用户
 */
exports.queryAllUsers = function(callback){
    mysql.query('select * from user',function(err, users){
        callback(err, users);
    });
};

/**
 * 通过用户名获取某一用户
 */
exports.queryUserByLoginName = function(loginname, callback) {
    mysql.queryOne('select * from user where loginname=?', [ loginname ], function(err, user) {
        callback(err, user);
    });

};

/**
 * 通过用户名或者email查询用户
 */
exports.queryUsersByEmailOrLoginName = function(loginname, email, callback){
    mysql.query('select * from user where loginname=? or email=?', [ loginname, email ], function(err, users) {
        callback(err, users);
    });
};

/**
 * 查看所有粉丝
 */
exports.queryAllFollowers = function(userId, callback) {
    mysql.query('select * from user where id in(select user_id from follow where following_id = ?)', [ userId ], function(err, users) {
        callback(err, users);
    });
};

/**
 * 查看所有关注
 */
exports.queryAllFollowings = function(userId, callback) {
    mysql.query('select * from user where id in(select following_id from follow where user_id = ?)', [ userId ], function(err, users) {
        callback(err, users);
    });
};

/**
 * 新建用户
 */
exports.saveUser = function(loginname, email, pass, createAt, avatarUrl, callback){
    mysql.update('insert into user(loginname,email,pwd,create_at,avatar) values(?,?,?,?,?)', [ loginname, email, pass, createAt, avatarUrl ], function(err, info) {
       callback(err, info);
    });
};

/**
 * 添加用户统计信息
 * 
 * @param users
 * @param func
 */
exports.userCount = function(users, func) {// 每个用户都需操作数据库n次，这个方法之后要替换，可以考虑数据库冗余这些统计信息
    async.map(users, function(user, callback) {
        async.parallel({
            following_count : function(cb) {// 关注
                mysql.queryOne("select count(following_id) as count from follow where user_id = ?", [ user.id ], function(err, count) {
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
                mysql.queryOne("select count(user_id) as count from follow where following_id = ?", [ user.id ], function(err, count) {
                    if (err || !count) {
                        cb(null, {
                            count : 0
                        });
                    }
                    else
                        cb(null, count);
                });
            },
            article_count : function(cb) {// 文章数
                mysql.queryOne('select count(id) as count from article where author_id = ?', [ user.id ], function(err, count) {
                    if (err || !count) {
                        cb(null, {
                            count : 0
                        });
                    }
                    else
                        cb(null, count);
                });
            },
        }, function(err, result) {
            user.following_count = result.following_count.count;
            user.follower_count = result.follower_count.count;
            user.article_count = result.article_count.count;
            callback(null, user);
        });
    }, function(err, users) {
        func(err, users);
    });
};

/**
 * 查询活跃用户
 */
exports.positiveUsers = function(callback){
    mysql.query('select author_id,count(id) as article_count from article group by author_id order by article_count desc limit ?', [8], function(err, kvs) {
        callback(err, kvs);
    });
};

/**
 * 更新密码
 */
exports.updatePwd = function(userId, pwd, callback){
    mysql.update('update user set pwd = ? where id = ?', [ common.md5(pwd), userId ], function(err,info){
        callback(err, info);
    });
};

/**
 * 更新头像
 */
exports.updateAvatar = function(userId, avatar, callback){
    mysql.updateAvatar('update user set avatar = ? where id = ?', [avatar, userId], function(err, info){
        callback(err, info);
    }); 
};

