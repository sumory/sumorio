var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

/**
 * 删除文章分类关系
 */
exports.deleteCategoriesOfArticle = function(articleId, callback) {
    mysql.update('delete from article_category where article_id = ?', [ articleId ], function(err, info) {
        callback(err, info);
    });
};

/**
 * 获取[文章-分类]关系
 */
exports.queryArticleCategoryByCategory = function(categoryId, callback){
    mysql.query('select * from article_category where category_id = ?', [ categoryId ], function(err, kvs) {
        callback(err, kvs);
    });
};

/**
 * 获取[文章-分类]关系
 */
exports.queryArticleCategoryByArticle = function(articleId, callback){
    mysql.query('select * from article_category where article_id = ?', [ articleId ], function(err, kvs) {
        callback(err, kvs);
    });
};