var log = require('../lib/log.js');
var config = require('../config.js').config;
var common = require('./common.js');
var mysql = require('../lib/mysql.js');

/**
 * 到所选用户首页
 * 
 * @param req
 * @param res
 * @param next
 */
exports.index = function(req, res, next) {
    var user_id = req.params.id;
    /*
    common.initSidebar(user_id, function(err, result) {
        if (err) {
            return next(err);
        }
        res.render('user/index', {
            result : result
        });
    });
    */
    res.redirect('/'+user_id+'/archives');
};

/**
 * 查看所有用户
 */
exports.users = function(req, res, next) {
    mysql.query('select * from user', function(err,users){//得到所有的用户
        mysql.query('select count(id) as count, author_id from archive group by author_id', function(err,result){
            for(var i = 0; i < users.length; i++){
                for(var j=0;j<result.length;j++){
                    if(users[i].id==result[j].author_id){
                        users[i].archive_count = result[j].count;
                        break;
                    }
                }
            }
            res.render('user/users', {
                users : users
            });
            return;
        });
        
    });
    
};
