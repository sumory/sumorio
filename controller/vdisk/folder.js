var async = require('async');
var sanitize = require('validator').sanitize;
var mysql = require('../../lib/mysql.js');
var common = require('../common/common.js');
var Util = require('../../lib/util.js');



/**
 * 点击编辑所有文件夹
 */
exports.edit_folders = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {error : '你还没有登录。' });
        return;
    }
    common.get_all_folders(req.session.user.id,function(err, folders){
        res.render('vdisk/edit_all_folders', {
            folders : folders
        });
    });
};

/**
 * 点击一个文件夹进行编辑
 */
exports.edit_folder = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var folder_id = req.params.folder_id;
    common.get_all_folders(req.session.user.id,function(err, folders){
        mysql.queryOne('select * from folder where user_id = ? and id = ?', [ user_id, folder_id ], function(err, folder) {
            if (err || !folder) {
                res.render('vdisk/edit_folder', {
                    folder : {},
                    folders : []
                });
                return;
            }
            else{
                res.render('vdisk/edit_folder', {
                    folder : folder,
                    folders : folders
                });
                return;
            }
        });
        
    });
};

/**
 * 修改一个文件夹
 */
exports.modify_folder = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {error : '你还没有登录。'});
        return;
    }

    var user_id = req.session.user.id;
    var folder_id = req.params.folder_id;

    async.parallel({
        info : function(cb) {// 编辑文件夹
            var name = sanitize(req.body.name).trim();
            name = sanitize(name).xss();
            var sequence = req.body.sequence;
            mysql.update('update folder set name=?, sequence=? where user_id = ? and id = ?', [ name, sequence, user_id, folder_id ], function(err, info) {
                if (err) {
                    res.render('notify/notify', {
                        error : '修改文件夹发生错误'
                    });
                    return;
                }
                cb(null, info);
            });
        },

    }, function(err, data) {
        if (err) {
            res.render('notify/notify', {
                error : '修改文件夹出错'
            });
            return;
        }
        common.get_all_folders(req.session.user.id, function(err, folders){
            res.render('vdisk/edit_all_folders', {
                folders : folders
            });
            return;
        });
        
    });
};

/**
 * 添加一个文件夹
 */
exports.add_folder = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();

    var sequence = req.body.sequence;

    if (name == '') {
        res.render('notify/notify', {
            error : '请输入文件夹名'
        });
        return;
    }

    mysql.insert('insert into folder(name,sequence,user_id,create_at) values(?,?,?,?)', [ name, sequence, req.session.user.id, Util.format_date(new Date()) ], function(err, info) {
        if (err) {
            res.render('notify/notify', {
                error : '创建新文件夹出错'
            });
            return;
        }
        res.redirect('/folders/edit');
    });
};

/**
 * 删除一个文件夹
 */
exports.delete_folder = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var folder_id = req.params.folder_id;

    mysql.query('select * from file where folder_id = ?', [ folder_id ], function(err, files) {
        if (err) {
            res.render('notify/notify', {
                error : '删除文件夹出错'
            });
            return;
        }
        if (files && files.length > 0) {
            res.render('notify/notify', {
                error : ' 删除文件夹时请先把文件移到其它文件夹下'
            });
            return;
        }
        mysql.update('delete from folder where id=? and user_id=?', [ folder_id, user_id ], function(err, info) {
            if (err) {
                res.render('notify/notify', {
                    error : '删除文件夹出错'
                });
                return;
            }
            res.redirect('/folders/edit');
        });
    });
};
