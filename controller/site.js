var config = require('../config').config;

exports.index = function(req, res, next) {

    res.render('index', {
        "welcome" : "welcome to sumorio"
    });

};
