var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

/**
 * 查询文件
 */
exports.queryFile = function(fileId, callback){
    mysql.queryOne('select * from file where id = ?', [fileId], function(err, file) {
        callback(err, file);
    });
};

/**
 * 保存文件
 */
exports.saveFile = function(fileName, userId, folderId, fileHashname, fileSize, fileMime, is_public, date ,description, callback){
    mysql.update('insert into file(name, user_id, folder_id, hash, size, mime, is_public, create_at, description) values(?,?,?,?,?,?,?,?,?)', [ fileName, userId, folderId, fileHashname, fileSize, fileMime, is_public, date ,description ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 查询用户文件夹下的所有文件
 */
exports.queryFiles = function(folderId, userId, callback){
    mysql.query('select * from file where folder_id = ? and user_id =?  order by create_at desc', [ folderId, userId ], function(err, files) {
        callback(err, files);
    });
};

/**
 * 查询文件夹下的所有文件
 */
exports.queryFilesOfFolder = function(folderId, callback){
    mysql.query('select * from file where folder_id = ? order by create_at desc', [ folderId ], function(err, files) {
        callback(err, files);
    });
};

/**
 * 批量按文件夹id查询文件总数
 */
exports.queryFilesCountOfFolders = function(folderIds, callback){
    mysql.query('select count(id) as count, folder_id from file where folder_id in(' + folderIds.join(',') + ') group by folder_id', [], function(err, kvs) {
        callback(err, kvs);
    });
};


/**
 * 删除文件
 */
exports.deleteFile = function(fileId, userId, callback){
    mysql.update('delete from file where id = ? and user_id = ?', [fileId, userId], function(err, info){
        callback(err, info);
    });
};

/**
 * 设置文件可见性：isPublic=1为可见，0为不可见
 */
exports.updateFileVisibility = function(isPublic, fileId, userId, callback){
    mysql.update('update file set is_public = ? where id = ? and user_id = ?', [isPublic, fileId, userId], function(err, info){
        callback(err, info);
    });
};

/**
 * 设置文件下载量
 */
exports.updateFileDownload = function(fileId, callback){
    mysql.update('update file set down_count = down_count+1 where id = ?', [fileId], function(err,info){
        callback(err, info);
    });
};

/**
 * 设置文件所属文件夹
 */
exports.updateFileFolder = function(fileId, folderId, userId, callback){
    mysql.update('update file set folder_id = ? where id = ? and user_id = ?', [ folderId, fileId, userId ], function(err,info){
        callback(err, info);
    });
};

/**
 * 查询最新文件
 */
exports.queryNewFiles = function(limit, callback){
    mysql.query('select * from file  where is_public = ? order by id desc limit ?', [ 1, limit ], function(err, files) {
        callback(err, files);
    });
};

/**
 * 查询下载量最多文件
 */
exports.queryHotFiles = function(limit, callback){
    mysql.query('select * from file  where is_public = ? order by down_count desc limit ?', [ 1, limit ], function(err, files) {
        callback(err, files);
    });
};

/**
 * 查询用户的公开文件
 */
exports.queryPublicFilesOfUser = function(userId, callback){
    mysql.query('select * from file where user_id = ? and is_public = ?', [ userId, 1 ], function(err, files) {
        callback(err, files);
    });
};


