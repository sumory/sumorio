var log = require('../lib/log.js');
var config = require('../config.js').config;
var common = require('./common.js');

/**
 * 到用户首页
 * 
 * @param req
 * @param res
 * @param next
 */
exports.index = function(req, res, next) {
    var user_id = req.params.id;

    common.initSidebar(user_id, function(err, result) {
        if (err) {
            return next(err);
        }
        res.render('user/index', {
            result : result
        });
    });
};
