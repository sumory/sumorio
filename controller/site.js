var config = require('../config').config;
var mysql = require('../lib/mysql.js');

exports.index = function(req, res, next) {

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
            
            res.render('index', {
                users : users
            });
            return;
        });
        
    });
    
};
