var fs = require('fs');
var path = require('path');
var async = require('async');
var ndir = require('ndir');
var log = require('../../lib/log.js');
var config = require('../../config.js').config;
var common = require('../common/common.js');
var mod = require('express/node_modules/connect/node_modules/formidable');
var userDao = require('../../dao/user.js');
var followDao = require('../../dao/follow.js');
var folderDao = require('../../dao/folder.js');
var categoryDao = require('../../dao/category.js');
var fileDao = require('../../dao/file.js');

var path_prefix = config.avatar_path;
var upload_path = path.join(path.dirname(__dirname), '../../public' + path_prefix);
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
    res.redirect('/'+user_id+'/articles');
};

/**
 * 查看所有用户
 */
exports.users = function(req, res, next) {
    userDao.queryAllUsers(function(err,users){//得到所有的用户
        userDao.userCount(users, function(err, users){
            res.render('users', {users : users});
            return;
        });
    });
};

/**
 * 点击修改头像
 */
exports.getAvatar = function(req, res, next){
    if (!req.session || !req.session.user) {
        res.render('notify/notify', { error : '请先登录'});
        return;
    } 
    userDao.queryUser(req.session.user.id, function(err, user){
        res.render('user/upload_avatar',{user : user});
        return;
    });
};

exports.userPwd = function(req, res, next){
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
exports.updateAvatar = function(req, res, next){
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
                userDao.updateAvatar( req.session.user.id, img_path, function(err, info){
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
exports.updatePwd = function(req, res, next){
    var old_pwd = req.body.old_pwd;
    var new_pwd = req.body.new_pwd;
    var user_id = req.session.user.id;
    userDao.queryUser(user_id, function(err, user){
        if(err){
            res.json({state : 'failed',msg : '查找信息失败'});
            return;
        }
        else if(user.pwd === common.md5(old_pwd)){
            userDao.updatePwd(user_id, common.md5(new_pwd), function(err,info){
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





/**
 * 查找活跃用户
 */
exports.positiveUsers = function(req, res, next) {
    userDao.positiveUsers(function(err, kvs) {
        if (err) {
            res.json({ users : []});
            return;
        }
        else{
            var ids = [];
            for(var i=0;i<kvs.length;i++){
                ids.push(kvs[i].author_id);
            }   
            if(ids && ids.length>0){
                userDao.queryUsers(ids, function(err, users){
                    if(err){
                        res.json({ users : users||[]});
                        return;
                    }
                    else{//组装统计数据
                        userDao.userCount(users, function(err, users){
                            res.json({ users : users||[]});
                            return;
                        });
                    }  
                });
            }
            else{
                res.json({ users : []});
                return;
            }
        }
    });
};


/**
 * 查看用户, 用于生成profile的sidebar
 */
exports.getUserInfo = function(req, res, next) {
    var user_id = req.params.user_id;
    async.parallel({
        following_count : function(cb) {// 关注
            followDao.queryFollowingCount(user_id, function(err, count) {
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
            followDao.queryFollowerCount(user_id, function(err, count) {
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
            userDao.queryUser(user_id, function(err, user) {
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
exports.getUserFolders = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({folders : []});
        return;
    }  
    
    var user_id = req.session.user.id;   
    folderDao.queryAllFoldersOfUser(user_id, function(err, folders) {
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
            fileDao.queryFilesCountOfFolders(folder_ids, function(err, kvs) {
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
exports.getUserCategories = function(req, res, next) {
    var user_id = req.params.user_id;
    categoryDao.queryCategoriesOfUser(user_id, function(err, categories) {
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
            categoryDao.queryArticlesCountOfCategories(category_ids, function(err, kvs) {
                for ( var j = 0; j < categories.length; j++) {
                    for ( var i = 0; i < kvs.length; i++) {
                        if (categories[j].id == kvs[i].category_id)
                            categories[j].article_count = kvs[i].count;
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
