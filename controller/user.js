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


