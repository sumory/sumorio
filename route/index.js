var user_ctrl = require('../controller/user.js');
exports.user_index = user_ctrl.index;
exports.auth_user = user_ctrl.auth_user;


var site_ctrl = require('../controller/site.js');
exports.site_index = site_ctrl.index;