var log = require('../lib/log.js');
var mysql = require('../lib/mysql.js');
var config = require('../config.js').config;

exports.index = function(req, res, next) {
  var user_id = req.params.id;
  console.log('进入index方法');
  mysql.query("select * from user where id = ?", [ user_id ], function(err,
      rows) {
    if (err)
      return next(err);
    if (!rows) {
      res.render('error/error', {
        error : '这个用户不存在。'
      });
      return;
    }
    res.render('user/index', {
      user : rows[0]
    });
  });

};

// auth_user middleware
exports.auth_user = function(req, res, next) {
  if (req.session.user) {
    if (config.admins[req.session.user.name]) {
      req.session.user.is_admin = true;
    }
    message_ctrl.get_messages_count(req.session.user._id, function(err, count) {
      if (err)
        return next(err);
      req.session.user.messages_count = count;
      res.local('current_user', req.session.user);
      return next();
    });
  }
  else {
    var cookie = req.cookies[config.auth_cookie_name];
    if (!cookie)
      return next();

    var auth_token = decrypt(cookie, config.session_secret);
    var auth = auth_token.split('\t');
    var user_id = auth[0];
    User.findOne({
      _id : user_id
    }, function(err, user) {
      if (err)
        return next(err);
      if (user) {
        if (config.admins[user.name]) {
          user.is_admin = true;
        }
        message_ctrl.get_messages_count(user._id, function(err, count) {
          if (err)
            return next(err);
          user.messages_count = count;
          req.session.user = user;
          res.local('current_user', req.session.user);
          return next();
        });
      }
      else {
        return next();
      }
    });
  }
};