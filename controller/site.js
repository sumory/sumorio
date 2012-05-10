var async = require('async');
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');
var common = require('./common/common.js');
var user_ctrl = require('./user.js');
/**
 * 网站首页主体数据
 */
exports.index = function(req, res, next) {
    async.auto({
        new_archives : function(cb) {
            filter_archives('select id,title,content,visit_count,reply_count,author_id,update_at,create_at  from archive  order by update_at desc limit ?', [5], cb);
        },
        most_visit_archives : function(cb) {
            filter_archives('select id,title,content,visit_count,reply_count,author_id,update_at,create_at  from archive  order by visit_count desc,update_at desc limit ?', [5], cb);
        },
        most_reply_archives : function(cb) {
            filter_archives('select id,title,content,visit_count,reply_count,author_id,update_at,create_at  from archive  order by reply_count desc,update_at desc limit ?', [5], cb);
        },
    }, function(err, results) {
        if (err) {
            res.render('notify/notify', { error : '首页数据加载失败'});
            return;
        }
        res.render('index', {
            new_archives : results.new_archives,
            most_reply_archives : results.most_reply_archives,
            most_visit_archives : results.most_visit_archives
        });
        return;
    });

};

/**
 * 查找活跃用户
 */
exports.positive_users = function(req, res, next) {
    mysql.query('select author_id,count(id) as archive_count from archive group by author_id order by archive_count desc limit ?', [8], function(err, kvs) {
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
                mysql.query('select * from user where id in ('+ids.join(',')+')',function(err, users){
                    if(err){
                        res.json({ users : users||[]});
                        return;
                    }
                    else{//组装统计数据
                        user_ctrl.user_count(users, function(err, users){
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


function filter_archives(sql, params, func){
    mysql.query(sql, params, function(err, archives) {
        if (err) {
            func(null, []);
            return;
        }
        else{
            async.map(archives, function(archive, callback) {    
                    mysql.queryOne('select * from user where id = ?', [ archive.author_id ], function(err, user) {
                        archive.friendly_create_at = Util.format_date(archive.create_at, true);
                        archive.friendly_update_at = Util.format_date(archive.update_at, true);
                        archive.author = user || {}; 
                        callback(null,archive);
                    });    
                }, 
                function(err,archives) {
                    if(err){
                        func(null, []);
                    }
                    else{
                        func(null, archives);
                    }
             }); 
        }
    });
}










