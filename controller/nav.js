var mysql = require('../lib/mysql.js');

/**
 * 得到全站所有导航
 * 
 */
exports.all_navs = function(req, res, next) {
    mysql.query('select * from nav order by id asc', function(err, navs) {
        res.json({
            navs : navs
        });
        return;
    });
};
