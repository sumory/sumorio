var async = require('async');
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');
var userDao = require('../dao/user.js');

/**
 * 网站首页主体数据
 */
exports.index = function(req, res, next) {
    async.auto({
        new_articles : function(cb) {
            filter_articles('select id,title,content,visit_count,reply_count,author_id,update_at,create_at  from article  order by update_at desc limit ?', [5], cb);
        },
        most_visit_articles : function(cb) {
            filter_articles('select id,title,content,visit_count,reply_count,author_id,update_at,create_at  from article  order by visit_count desc,update_at desc limit ?', [5], cb);
        },
        most_reply_articles : function(cb) {
            filter_articles('select id,title,content,visit_count,reply_count,author_id,update_at,create_at  from article  order by reply_count desc,update_at desc limit ?', [5], cb);
        },
    }, function(err, results) {
        if (err) {
            res.render('notify/notify', { error : '首页数据加载失败'});
            return;
        }
        res.render('index', {
            new_articles : results.new_articles,
            most_reply_articles : results.most_reply_articles,
            most_visit_articles : results.most_visit_articles
        });
        return;
    });
};


/**
 * 方法待优化
 * @param sql
 * @param params
 * @param func
 */
function filter_articles(sql, params, func){
    mysql.query(sql, params, function(err, articles) {
        if (err) {
            func(null, []);
            return;
        }
        else{
            async.map(articles, function(article, callback) {    
                    userDao.queryUser( article.author_id , function(err, user) {
                        article.friendly_create_at = Util.format_date(article.create_at, true);
                        article.friendly_update_at = Util.format_date(article.update_at, true);
                        article.author = user || {}; 
                        callback(null,article);
                    });    
                }, 
          function(err,articles) {
                    if(err){
                        func(null, []);
                    }
                    else{
                        func(null, articles);
                    }
             }); 
        }
    });
}

