var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');


/**
 * 得到所有文件夹
 */
exports.queryAllFoldersOfUser = function(userId, callback) {
    mysql.query('select * from folder where user_id = ? order by sequence asc', [ userId ], function(err, folders) {
        callback(err, folders);
    });
};

/**
 * 查询folder
 */
exports.queryFolder = function(userId, folderId, callback){
    mysql.queryOne('select * from folder where id = ? and user_id = ?', [folderId, userId], function(err, folder){
        callback(err, folder);
    });
};

/**
 * 更新文件夹信息
 */
exports.updateFolder = function(name, sequence, userId, folderId, callback){
    mysql.update('update folder set name=?, sequence=? where user_id = ? and id = ?', [ name, sequence, userId, folderId ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 创建文件夹
 */
exports.saveFolder = function(name, sequence, userId, createAt, callback){
    mysql.update('insert into folder(name,sequence,user_id,create_at) values(?,?,?,?)', [ name, sequence, userId, createAt ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 删除文件夹
 */
exports.deleteFolder = function(folderId, userId, callback){
    mysql.update('delete from folder where id=? and user_id=?', [ folderId, userId ], function(err, info) {
        callback(err, info);
    });
};