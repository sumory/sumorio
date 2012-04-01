var config = require('../config').config;
var mysql = require('../lib/mysql.js');

/**
 * 网站首页
 */
exports.index = function(req, res, next) {

    mysql.query('select  id,title,content,visit_count,reply_count,author_id,DATE_FORMAT(update_at,"%Y-%m-%d %H:%i:%s") as update_at,DATE_FORMAT(create_at,"%Y-%m-%d %H:%i:%s") as create_at  from archive order by update_at desc',
            function(err, archives) {
                if (err) {
                    res.render('notify/notify', {
                        error : '查找所有文章出错'
                    });
                    return;
                }
                res.render('index', {
                    archives : archives
                });
                return;
    });

};
