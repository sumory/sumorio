var user_ctrl = require('./controller/user/user.js');
var site_ctrl = require('./controller/site.js');
var sign_ctrl = require('./controller/sign.js');
var category_ctrl = require('./controller/blog/category.js');
var article_ctrl = require('./controller/blog/article.js');
var reply_ctrl = require('./controller/blog/reply.js');
var upload_ctrl = require('./controller/blog/upload.js');
var follow_ctrl = require('./controller/user/follow.js');
var message_ctrl = require('./controller/message/message.js');
var folder_ctrl = require('./controller/vdisk/folder.js');
var file_ctrl = require('./controller/vdisk/file.js');

exports = module.exports = function(app) {// routes
    // 首页
    app.get('/', site_ctrl.index);

    // 注册登录相关
    app.get('/signup', sign_ctrl.signup);
    app.get('/signin', sign_ctrl.signin);
    app.get('/signout', sign_ctrl.signout);
    app.post('/signup', sign_ctrl.signup);
    app.post('/signin', sign_ctrl.signin);

    // 用户相关
    app.get('/user/:id', user_ctrl.index);
    app.get('/avatar', user_ctrl.getAvatar);
    app.post('/avatar/update', user_ctrl.updateAvatar);
    app.get('/pwd', user_ctrl.userPwd);
    app.post('/pwd/update', user_ctrl.updatePwd);
    app.get('/users', user_ctrl.users);
    app.post('/positive_users', user_ctrl.positiveUsers);

    // sidebar
    app.post('/userinfo/user/:user_id', user_ctrl.getUserInfo);
    app.post('/userinfo/category/:user_id', user_ctrl.getUserCategories);
    app.post('/userinfo/folder', user_ctrl.getUserFolders);

    // 文章分类相关
    app.get('/categories/edit', category_ctrl.editCategories);
    app.get('/category/:category_id/edit', category_ctrl.editCategory);
    app.post('/category/:category_id/modify', category_ctrl.modifyCategory);
    app.post('/category/add', category_ctrl.addCategory);
    app.get('/category/:category_id/delete', category_ctrl.deleteCategory);

    // 文章相关
    app.get('/article/create', article_ctrl.createArticle);
    app.post('/article/create', article_ctrl.createArticle);
    app.get('/article/:article_id/edit', article_ctrl.editArticle);
    app.post('/article/:article_id/modify', article_ctrl.modifyArticle);
    app.get('/article/:article_id/delete', article_ctrl.deleteArticle);
    app.get('/articles/:user_id/:category_id', article_ctrl.viewArticlesOfUserCategory);
    app.get('/:user_id/articles', article_ctrl.viewArticlesOfUser);
    app.get('/article/:article_id', article_ctrl.viewArticle);

    // reply
    app.post('/:article_id/reply', reply_ctrl.createReply);
    app.post('/reply/:reply_id/delete', reply_ctrl.deleteReply);

    // 上传图片
    app.post('/upload/image', upload_ctrl.upload_image);


    // follow相关
    app.post('/follow/:to_follow_id', follow_ctrl.follow);
    app.post('/unfollow/:to_unfollow_id', follow_ctrl.unfollow);
    app.post('/isfollow/:user_id', follow_ctrl.isfollow);
    app.get('/:user_id/following', follow_ctrl.view_followings);
    app.get('/:user_id/follower', follow_ctrl.view_followers);

    // message相关
    app.post('/messages/unread', message_ctrl.unread_message_count);
    app.get('/messages', message_ctrl.view_messages);
    app.get('/messages/mark_all_read', message_ctrl.mark_all_read);

    // folder相关
    app.get('/folders/edit', folder_ctrl.editFolders);
    app.get('/folder/:folder_id/edit', folder_ctrl.editFolder);
    app.post('/folder/:folder_id/modify', folder_ctrl.modifyFolder);
    app.post('/folder/add', folder_ctrl.addFolder);
    app.get('/folder/:folder_id/delete', folder_ctrl.deleteFolder);

    // file相关
    app.post('/file/upload', file_ctrl.uploadFile);
    app.get('/file/upload', file_ctrl.uploadFile);
    app.post('/file/add', file_ctrl.addFile);
    app.get('/:folder_id/files', file_ctrl.viewFilesOfFolder);
    app.post('/file/:file_id/private', file_ctrl.set_file_private);
    app.post('/file/:file_id/public', file_ctrl.set_file_public);
    app.post('/file/:file_id/delete', file_ctrl.deleteFile);
    app.get('/file/:file_id', file_ctrl.viewFile);
    app.post('/file/:file_id/tofolder/:folder_id', file_ctrl.change_file_folder);
    app.get('/:user_id/files/share', file_ctrl.user_share_files);
    app.get('/file/:file_id/download', file_ctrl.downloadFile);
    app.get('/files', file_ctrl.files);
};
