var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');
var async = require('async');

/**
 * 查询某分类
 */
exports.queryCategory = function(categoryId, callback){
    mysql.queryOne('select * from category where id =?', [categoryId ], function(err, category) {
        callback(err, category);
    });
};

/**
 * 删除分类
 */
exports.deleteCategory = function(userId, categoryId, callback){
    mysql.update('delete from category where id=? and user_id=?', [ categoryId, userId ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 根据文章id查询文章的所属category信息
 */
exports.queryCategoriesOfArticle = function(articleId, callback) {
    mysql.query("select * from category where id in (select category_id from article_category where article_id=?)", [ articleId ], function(err, categories) {
        callback(err, categories);
    });
};

/**
 * 得到用户的所有文章分类
 */
exports.queryCategoriesOfUser = function(userId, callback) {
    mysql.query('select * from category where user_id = ? order by sequence asc', [ userId ], function(err, categories) {
        callback(err, categories);
    });
};


/**
 * 批量按分类id查询文章总数
 */
exports.queryArticlesCountOfCategories = function(categoryIds, callback){
    mysql.query('select category_id,count(article_id) as count from article_category where category_id in(' + categoryIds.join(',') + ') group by category_id', [], function(err, kvs) {
        callback(err, kvs);
    });
};

/**
 * 更新分类
 */
exports.updateCategory = function(name, sequence, userId, categoryId, callback) {
    mysql.update('update category set name=?, sequence=? where user_id = ? and id = ?', [ name, sequence, userId, categoryId ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 保存文章分类
 */
exports.saveCategory = function(name, sequence, userId, callback) {
    mysql.update('insert into category(name,sequence,user_id) values(?,?,?)', [ name, sequence, userId ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 保存文章分类
 */
exports.saveCategoriesOfArticle = function(articleId, categories, callback) {
    async.forEach(categories, function(category_item, cb) {
        mysql.update('insert into article_category(article_id, category_id) values(?,?)', [ articleId, category_item ], function(err, info) {
            if (err) {
                cb(err, info);
            }
            else {
                cb(null, null);
            }
        });
    }, function(err, categories) {
        callback(err, categories);
    });
};
