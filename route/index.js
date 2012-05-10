
var user_ctrl = require('../controller/user.js');
exports.user_index = user_ctrl.index;
exports.users = user_ctrl.users;
exports.user_atavar = user_ctrl.get_avatar;
exports.update_user_avatar = user_ctrl.update_avatar;
exports.user_pwd = user_ctrl.user_pwd;
exports.update_user_pwd = user_ctrl.update_pwd;

var site_ctrl = require('../controller/site.js');
exports.site_index = site_ctrl.index;
exports.positive_users = site_ctrl.positive_users;

var sign_ctrl = require('../controller/sign.js');
exports.signup = sign_ctrl.signup;
exports.signin = sign_ctrl.signin;
exports.signout = sign_ctrl.signout;
exports.auth_user = sign_ctrl.auth_user;

var category_ctrl = require('../controller/blog/category.js');
exports.edit_categories = category_ctrl.edit_categories;
exports.edit_category = category_ctrl.edit_category;
exports.modify_category = category_ctrl.modify_category;
exports.add_category = category_ctrl.add_category;
exports.delete_category = category_ctrl.delete_category;

var archive_ctrl = require('../controller/blog/archive.js');
exports.create_archive = archive_ctrl.create_archive;
exports.edit_archive = archive_ctrl.edit_archive;
exports.modify_archive = archive_ctrl.modify_archive;
exports.delete_archive = archive_ctrl.delete_archive;
exports.view_archives = archive_ctrl.view_archives;
exports.view_archive = archive_ctrl.view_archive;
exports.view_user_archives = archive_ctrl.view_user_archives;

var reply_ctrl = require('../controller/blog/reply.js');
exports.create_reply = reply_ctrl.create_reply;
exports.create_reply2 = reply_ctrl.create_reply2;
exports.delete_reply = reply_ctrl.delete_reply;

var upload_ctrl = require('../controller/blog/upload.js');
exports.upload_image = upload_ctrl.upload_image;

var nav_ctrl = require('../controller/nav.js');
exports.all_navs = nav_ctrl.all_navs;


var follow_ctrl = require('../controller/follow.js');
exports.follow = follow_ctrl.follow;
exports.unfollow = follow_ctrl.unfollow;
exports.isfollow = follow_ctrl.isfollow;
exports.view_followings = follow_ctrl.view_followings;
exports.view_followers = follow_ctrl.view_followers;

var message_ctrl = require('../controller/message.js');
exports.unread_message_count = message_ctrl.unread_message_count;
exports.view_messages = message_ctrl.view_messages;
exports.mark_all_read = message_ctrl.mark_all_read;

var folder_ctrl = require('../controller/vdisk/folder.js');
exports.edit_all_folders = folder_ctrl.edit_folders;
exports.edit_folder = folder_ctrl.edit_folder;
exports.modify_folder = folder_ctrl.modify_folder;
exports.add_folder = folder_ctrl.add_folder;
exports.delete_folder = folder_ctrl.delete_folder;


var common_ctrl = require('../controller/common/common.js');
exports.userinfo_category = common_ctrl.get_categories;
exports.userinfo_user = common_ctrl.get_user;
exports.userinfo_folder = common_ctrl.get_folders;

var file_ctrl = require('../controller/vdisk/file.js');
exports.upload_file = file_ctrl.upload_file;
exports.to_upload_file = file_ctrl.upload_file;
exports.add_file = file_ctrl.add_file;
exports.view_folder_files = file_ctrl.view_folder_files;
exports.set_file_private = file_ctrl.set_file_private;
exports.set_file_public = file_ctrl.set_file_public;
exports.delete_file = file_ctrl.delete_file;
exports.view_file = file_ctrl.view_file;
exports.change_file_folder = file_ctrl.change_file_folder;
exports.user_share_files = file_ctrl.user_share_files;
exports.download_file = file_ctrl.download_file;
exports.files = file_ctrl.files;




