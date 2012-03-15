var user_ctrl = require('../controller/user.js');
exports.user_index = user_ctrl.index;


var site_ctrl = require('../controller/site.js');
exports.site_index = site_ctrl.index;


var sign_ctrl = require('../controller/sign.js');
exports.signup = sign_ctrl.signup;
exports.signin = sign_ctrl.signin;
exports.signout = sign_ctrl.signout;
exports.auth_user = sign_ctrl.auth_user;

var category_ctrl = require('../controller/category.js');
exports.edit_categories = category_ctrl.edit_categories;
exports.edit_category = category_ctrl.edit_category;
exports.modify_category = category_ctrl.modify_category;
exports.add_category = category_ctrl.add_category;
exports.delete_category = category_ctrl.delete_category;

var archive_ctrl = require('../controller/archive.js');
exports.create_archive = archive_ctrl.create_archive;
exports.edit_archive = archive_ctrl.edit_archive;
exports.modify_archive = archive_ctrl.modify_archive;
exports.delete_archive = archive_ctrl.delete_archive;
exports.view_archives = archive_ctrl.view_archives;
exports.view_archive = archive_ctrl.view_archive;















