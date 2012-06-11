var async = require('async');
var sanitize = require('validator').sanitize;
var Util = require('../../lib/util.js');
var folderDao = require('../../dao/folder.js');
var fileDao = require('../../dao/file.js');

/**
 * 点击编辑所有文件夹
 */
exports.editFolders = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }
    folderDao.queryAllFoldersOfUser(req.session.user.id, function(err, folders) {
        res.render('vdisk/edit_all_folders', {
            folders : folders
        });
    });
};

/**
 * 点击一个文件夹进行编辑
 */
exports.editFolder = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var folder_id = req.params.folder_id;
    folderDao.queryAllFoldersOfUser(req.session.user.id, function(err, folders) {
        folderDao.queryFolder(user_id, folder_id, function(err, folder) {
            if (err || !folder) {
                res.render('vdisk/edit_folder', {
                    folder : {},
                    folders : []
                });
                return;
            }
            else {
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
exports.modifyFolder = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var folder_id = req.params.folder_id;
    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var sequence = req.body.sequence;
    folderDao.updateFolder(name, sequence, user_id, folder_id, function(err, info) {
        if (err) {
            res.render('notify/notify', {
                error : '修改文件夹发生错误'
            });
            return;
        }
        else {
            folderDao.queryAllFoldersOfUser(req.session.user.id, function(err, folders) {
                res.render('vdisk/edit_all_folders', {
                    folders : folders || []
                });
                return;
            });
        }
    });

};

/**
 * 添加一个文件夹
 */
exports.addFolder = function(req, res, next) {
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

    folderDao.saveFolder(name, sequence, req.session.user.id, Util.format_date(new Date()), function(err, info) {
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
exports.deleteFolder = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var folder_id = req.params.folder_id;

    fileDao.queryFilesOfFolder(folder_id, function(err, files) {
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
        folderDao.deleteFolder(folder_id, user_id, function(err, info) {
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
