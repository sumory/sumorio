var fs = require('fs');
var path = require('path');
var ndir = require('ndir');
var async = require('async');
var mod = require('express/node_modules/connect/node_modules/formidable');
var Util = require('../../lib/util.js');
var common = require('../common/common.js');
var config = require('../../config.js').config;
var memssage_ctrl = require('../message/message.js');
var folderDao = require('../../dao/folder.js');
var fileDao = require('../../dao/file.js');
var userDao = require('../../dao/user.js');

var upload_path = config.vdisk_path;
ndir.mkdir(upload_path, function(err) {
    if (err)
        throw err;
    mod.IncomingForm.UPLOAD_DIR = upload_path;
});

/**
 * 上传文件
 */
exports.uploadFile = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.send('forbidden!登录后才可执行该操作');
        return;
    }

    var method = req.method.toLowerCase();
    if (method == 'get') {
        folderDao.queryAllFoldersOfUser(req.session.user.id, function(err, folders) {
            res.render('vdisk/upload_file', {
                folders : folders
            });
            return;
        });
    }
    else {
        var file = req.files.attachment;
        if (file) {
            var name = file.name;
            var ext = name.substr(name.lastIndexOf('.'), 4);
            var uid = req.session.user.id.toString();
            var time = new Date().getTime();
            var new_name = uid + time + ext;
            var userDir = path.join(upload_path, uid);
            ndir.mkdir(userDir, function(err) {
                if (err) {
                    res.json({
                        state : 'falied'
                    });
                    return;
                }

                var new_path = path.join(userDir, new_name);
                fs.rename(file.path, new_path, function(err) {
                    if (err) {
                        res.json({
                            state : 'falied'
                        });
                        return;
                    }
                    else {
                        var result = {};
                        result.hashname = new_name;
                        result.name = name;
                        result.mime = file.type;
                        result.size = file.length;
                        res.json({
                            state : 'success',
                            result : result
                        });
                        return;
                    }

                });
            });
        }
        else {
            res.json({
                state : 'failed'
            });
            return;
        }
    }
};

/**
 * 添加一个文件
 */
exports.addFile = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var folder_id = req.body.folder_id;
    var is_public = req.body.is_public;
    var description = req.body.description;
    var user_id = req.session.user.id;
    var file = JSON.parse(req.body.uploadFile);

    fileDao.saveFile(file.name, user_id, folder_id, file.hashname, file.size, file.mime, is_public, Util.format_date(new Date()), description, function(err, info) {
        if (err) {
            res.render('notify/notify', {
                error : '保存文件到文件夹出错'
            });
            return;
        }
        else {// 发消息
            var mbody = {};
            mbody.from_user_id = req.session.user.id;
            mbody.from_user_name = req.session.user.loginname;
            mbody.file_id = info.insertId;
            mbody.file_name = file.name;
            memssage_ctrl.batch_create_message(common.MessageType.share_file, req.session.user.id, JSON.stringify(mbody), function(err) {
            });
            res.redirect('/file/' + info.insertId);
        }
    });
};

/**
 * 查询文件夹下文件列表
 */
exports.viewFilesOfFolder = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录,不能查看您网盘中的文件'
        });
        return;
    }

    var folder_id = req.params.folder_id;
    var user_id = req.session.user.id;

    folderDao.queryFolder(user_id, folder_id, function(err, folder) {
        if (err) {
            res.render('notify/notify', {
                error : '查找文件夹基本信息出错'
            });
            return;
        }
        else if (!folder || folder.length <= 0) {
            res.render('notify/notify', {
                error : '该文件夹不存在或您不具备访问该文件夹的权限'
            });
            return;
        }
        else {
            fileDao.queryFiles(folder_id, user_id, function(err, files) {
                if (err) {
                    res.render('vdisk/folder_files', {
                        files : [],
                        folder : folder,
                        folders : [],
                        user_id : user_id
                    });
                    return;
                }
                folderDao.queryAllFoldersOfUser(user_id, function(err, folders) {
                    res.render('vdisk/folder_files', {
                        files : files || [],
                        folder : folder,
                        folders : folders || [],
                        user_id : user_id
                    });
                    return;
                });
            });
        }
    });
};

/**
 * 删除文件
 */
exports.deleteFile = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({
            flag : 'failed'
        });
        return;
    }
    var user_id = req.session.user.id;
    var file_id = req.params.file_id;

    fileDao.deleteFile(file_id, user_id, function(err, info) {
        if (err) {
            res.json({
                flag : 'failed'
            });
            return;
        }
        else {
            res.json({
                flag : 'success'
            });
            return;
        }
    });
};

/**
 * 设置文件为公开
 */
exports.set_file_public = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({
            flag : 'failed'
        });
        return;
    }
    var user_id = req.session.user.id;
    var file_id = req.params.file_id;

    fileDao.updateFileVisibility(1, file_id, user_id, function(err, info) {
        if (err) {
            res.json({
                flag : 'failed'
            });
            return;
        }
        else {
            fileDao.queryFile(file_id, function(err, file) {
                var mbody = {};
                mbody.from_user_id = user_id;
                mbody.from_user_name = req.session.user.loginname;
                mbody.file_id = file_id;
                mbody.file_name = file.name;
                memssage_ctrl.batch_create_message(common.MessageType.share_file, user_id, JSON.stringify(mbody), function(err) {
                });
                res.json({
                    flag : 'success'
                });
                return;
            });
        }
    });
};

/**
 * 设置文件为私密
 */
exports.set_file_private = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({
            flag : 'failed'
        });
        return;
    }
    var user_id = req.session.user.id;
    var file_id = req.params.file_id;

    fileDao.updateFileVisibility(0, file_id, user_id, function(err, info) {
        if (err) {
            res.json({
                flag : 'failed'
            });
            return;
        }
        else {
            res.json({
                flag : 'success'
            });
            return;
        }
    });
};

/**
 * 查看文件详细信息
 */
exports.viewFile = function(req, res, next) {
    var file_id = req.params.file_id;

    // 如果文件是公开的，则所有人可以看，如果是私密的则只有拥有者可以看
    fileDao.queryFile(file_id, function(err, file) {
        if (err) {
            res.render('notify/notify', {
                error : '查看文件详细信息出错,该文件可能不存在或已被删除'
            });
            return;
        }
        else if (file) {
            file = format_file(file);
            if (req.session && req.session.user && (req.session.user.id == file.user_id)) {// 如果为当前文件拥有者, 则显示文件夹目录和设置信息
                folderDao.queryAllFoldersOfUser(req.session.user.id, function(err, folders) {
                    if (err) {
                        res.render('notify/notify', {
                            error : '查看文件详细信息时查找文件夹目录出错'
                        });
                        return;
                    }
                    else {
                        res.render('vdisk/file', {
                            file : file,
                            folders : folders,
                            isOwner : true
                        });
                        return;
                    }
                });
            }
            else {// 非当前文件拥有者，要根据文件是否公开
                if (file.is_public == '公开') {// 文件公开
                    res.render('vdisk/file', {
                        file : file,
                        isOwner : false
                    });
                    return;
                }
                else {// 文件私有
                    res.render('notify/notify', {
                        error : '文件现在状态为私密,您不具备查看该文件权限'
                    });
                    return;
                }
            }
        }
        else {
            res.render('notify/notify', {
                error : '您查找的文件不存在或已被删除'
            });
            return;
        }
    });
};

/**
 * 下载文件
 */
exports.downloadFile = function(req, res, next) {
    var file_id = req.params.file_id;

    // 如果文件是公开的，则所有人可以下载，如果是私密的则只有拥有者可以下载
    fileDao.queryFile(file_id, function(err, file) {
        if (err) {
            res.render('notify/notify', {
                error : '下载文件出错,该文件可能不存在或已被删除'
            });
            return;
        }
        else if (file) {
            if (file.is_public == 1 || (req.session && req.session.user && (req.session.user.id == file.user_id))) {// 文件公开;文件私有，只有拥有者可以下载
                fileDao.updateFileDownload(file.id, function(err, info) {
                    res.header('Content-Type', "application/octet-stream;charset=utf-8");
                    res.header('Content-Length', file.size);
                    res.header('Content-Disposition', "attachment;filename=" + file.name);
                    res.sendfile(upload_path + '/' + file.user_id + '/' + file.hash);
                });
            }
            else {
                res.render('notify/notify', {
                    error : '您不具备下载该文件权限'
                });
                return;
            }
        }
        else {
            res.render('notify/notify', {
                error : '您要下载的文件不存在'
            });
            return;
        }
    });
};

/**
 * 改变文件的所属文件夹
 */
exports.change_file_folder = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({
            flag : 'failed',
            msg : '用户未登录，不得修改文件属性'
        });
        return;
    }
    var folder_id = req.params.folder_id;
    var file_id = req.params.file_id;
    fileDao.updateFileFolder(file_id,folder_id,  req.session.user.id, function(err, info) {
        if (err) {
            res.json({
                flag : 'failed',
                msg : '修改属性失败'
            });
            return;
        }
        else {
            res.json({
                flag : 'success',
                msg : '修改成功'
            });
            return;
        }
    });

};

/**
 * 一级导航：‘文件’
 */
exports.files = function(req, res, next) {

    async.auto({
        new_files : function(cb) {
            fileDao.queryNewFiles(8, function(err, new_files) {
                if (err) {
                    res.render('notify/notify', {
                        error : '查询最新文件列表出错'
                    });
                    return;
                }
                else {
                    file_user_info(new_files, function(err, new_files) {
                        cb(null, new_files);
                    });
                }
            });
        },
        hot_files : function(cb) {
            fileDao.queryHotFiles(10, function(err, hot_files) {
                if (err) {
                    res.render('notify/notify', {
                        error : '查询最新文件列表出错'
                    });
                    return;
                }
                else {
                    file_user_info(hot_files, function(err, hot_files) {
                        cb(null, hot_files);
                    });
                }
            });
        },
    }, function(err, results) {
        if (err) {
            res.render('notify/notify', {
                error : '查找文件列表失败'
            });
            return;
        }
        res.render('files', {
            new_files : results.new_files,
            hot_files : results.hot_files
        });
        return;
    });

};

/**
 * 获取用户设为公开的共享文件
 */
exports.user_share_files = function(req, res, next) {
    var user_id = req.params.user_id;
    fileDao.queryPublicFilesOfUser(user_id, function(err, files) {
        if (err) {
            res.render('notify/notify', {
                error : '查找用户共享文件发生错误'
            });
            return;
        }
        else {
            res.render('vdisk/share_files', {
                user_id : user_id,
                files : files
            });
            return;
        }
    });
};

// -------------------------------------------------------------------------------

/**
 * 格式化file的一些属性
 * 
 * @param file
 * @returns
 */
function format_file(file) {
    var bytevalue = file.size;
    if (bytevalue < 1024) {
        file.size = bytevalue + ' Bytes';
    }
    else if (bytevalue >= 1024 && bytevalue < 1024 * 1024) {
        file.size = Math.round(bytevalue / 1024) + ' K';
    }
    else if (bytevalue >= 1024 * 1024 && bytevalue < 1024 * 1024 * 1024) {
        file.size = Math.round(bytevalue / 1024 / 1024) + ' M';
    }
    else
        file.size = '大于1G';

    var file_visible_map = {
        1 : '公开',
        0 : '私密'
    };
    file.is_public = file_visible_map[file.is_public];
    file.create_at = Util.format_date(file.create_at);
    return file;
}

/**
 * 添加用户信息
 * 
 * @param files
 * @param func
 */
function file_user_info(files, func) {
    async.map(files, function(file, callback) {
        userDao.queryUser(file.user_id, function(err, user) {
            if (err || !user) {
                file.user = {};
                callback(null, file);
            }
            else {
                file.user = user;
                callback(null, file);
            }
        });
    }, function(err, files) {
        func(err, files);
    });
}
