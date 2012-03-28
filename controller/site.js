var config = require('../config').config;
var mysql = require('../lib/mysql.js');

exports.index = function(req, res, next) {

    mysql.query('select * from user', function(err,users){//得到所有的用户
        res.render('index', {
            users : users
        });
        return;
    });
    
};
