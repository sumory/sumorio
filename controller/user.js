var fs = require('fs');
var path = require('path');
var async = require('async');
var ndir = require('ndir');
var log = require('../lib/log.js');
var config = require('../config.js').config;
var common = require('./common/common.js');
var mysql = require('../lib/mysql.js');
var mod = require('express/node_modules/connect/node_modules/formidable');


var path_prefix = config.avatar_path;
var upload_path = path.join(path.dirname(__dirname), '../public' + path_prefix);
ndir.mkdir(upload_path, function(err) {
    if (err)
        throw err;
    mod.IncomingForm.UPLOAD_DIR = upload_path;
});

/**
 * 到所选用户首页
 * 
 */
exports.index = function(req, res, next) {
    var user_id = req.params.id;
    res.redirect('/'+user_id+'/archives');
};

/**
 * 查看所有用户
 */
exports.users = function(req, res, next) {
    mysql.query('select * from user', function(err,users){//得到所有的用户
        user_count(users, function(err, users){
            res.render('users', {users : users});
            return;
        });
    });
};

/**
 * 点击修改头像
 */
exports.get_avatar = function(req, res, next){
    if (!req.session || !req.session.user) {
        res.render('notify/notify', { error : '请先登录'});
        return;
    }
    
    getUser(req.session.user.id, function(err, user){
        
        res.render('user/upload_avatar',{user : user});
        return;
    });
};

exports.user_pwd = function(req, res, next){
    if (!req.session || !req.session.user) {
        res.render('notify/notify', { error : '请先登录'});
        return;
    }
    res.render('user/update_pwd',{});
    return;

};

/**
 * 上传头像
 */
exports.update_avatar = function(req, res, next){
    if (!req.session || !req.session.user) {
        res.render('notify/notify', { error : '登录后才可修改头像'});
        return;
    }

    var file = req.files.avatar;

    if (file) {
        var name = file.name;
        var ext = name.substr(name.lastIndexOf('.'), 4);
        var uid = req.session.user.id;
        var new_name = uid + ext;
        var new_path = path.join(upload_path, new_name);
        var img_path = path_prefix +'/'+ new_name;
        
        fs.rename(file.path, new_path, function(err) {
            if (err) {
                res.json({ state : 'failed'});
                return;
            }
            else{
                mysql.update('update user set avatar = ? where id = ?', [img_path, req.session.user.id], function(err, info){
                    res.json({
                        state : 'success',
                        url : img_path
                    });
                    return;
                }); 
            }       
        });
    }
    else {
        res.json({
            state : 'failed'
        });
        return;
    }
};

/**
 * 修改密码
 */
exports.update_pwd = function(req, res, next){
    var old_pwd = req.body.old_pwd;
    var new_pwd = req.body.new_pwd;
    var user_id = req.session.user.id;
    console.log(req);
    getUser(user_id, function(err, user){
        console.log(user);
        if(err){
            res.json({state : 'failed',msg : '查找信息失败'});
            return;
        }
        else if(user.pwd === common.md5(old_pwd)){
            mysql.update('update user set pwd = ? where id = ?', [ common.md5(new_pwd), user_id ], function(err,info){
                if(err){
                    res.json({state : 'failed',msg : '修改失败'});
                    return;
                }
                else{
                    res.json({state : 'success',msg : '修改成功'});
                    return;
                }
            });
        }
        else{
            res.json({state : 'failed',msg : '原密码错误'});
            return;
        }
    });
};

exports.getUser = getUser;
exports.user_count = user_count;

// ----------------------------------------------------------------------------------------------

/**
 * 获取某一用户信息
 * @param user_id
 * @param callback
 */
function getUser(user_id, callback){
    mysql.queryOne("select * from user where id = ?", [ user_id ], function(err, user) {
        callback(err, user);
    });
};

/**
 * 添加用户统计信息
 * @param users
 * @param func
 */
function user_count(users, func){//每个用户都需操作数据库n次，这个方法之后要替换，可以考虑数据库冗余这些统计信息
    async.map(users, function(user, callback) {    
        async.parallel({
            following_count : function(cb) {// 关注
                mysql.queryOne("select count(following_id) as count from follow where user_id = ?", [ user.id ], function(err, count) {
                    if (err || !count) {
                        cb(null, {count : 0 });
                    }
                    else
                        cb(null, count);
                });
            },
            follower_count : function(cb) {// 粉丝
                mysql.queryOne("select count(user_id) as count from follow where following_id = ?", [ user.id ], function(err, count) {
                    if (err || !count) {
                        cb(null, {count : 0});
                    }
                    else
                        cb(null, count);
                });
            },
            archive_count : function(cb){//文章数
                mysql.queryOne('select count(id) as count from archive where author_id = ?', [user.id], function(err, count){
                    if (err || !count) {
                        cb(null, {count : 0});
                    }
                    else
                        cb(null, count);
                }); 
            },
        }, function(err, result) {     
            user.following_count =result.following_count.count;
            user.follower_count = result.follower_count.count;
            user.archive_count = result.archive_count.count;
            callback(null, user);
        });
    }, 
    function(err,users) {
        func(err,users);
    }); 
}

