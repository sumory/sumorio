var fs = require('fs');
var path = require('path');
var ndir = require('ndir');

var mod = require('express/node_modules/connect/node_modules/formidable');
var upload_path = '/home';//path.join(path.dirname(__dirname), 'public/user_data/images');
ndir.mkdir(upload_path, function(err) {
    if (err)
        throw err;
    mod.IncomingForm.UPLOAD_DIR = upload_path;
});

/**
 * 上传文件，前端是flash
 * 1. 注意修改ueditor的配置，尤其是ueditor/dialogs/image/image.html（insertBatch函数已改为采用非相对地址）和ueditor/editor_config.js
 * 2. express/node_modules/connect/lib/middleware/csrf.js添加if (req.body && req.body.user_action === 'upload_image') return next();
 *    ueditor的配置文件里加上name='user_action' value='upload_image'的输入框
 * 
 * @param req
 * @param res
 * @param next
 */
exports.upload_image = function(req, res, next) {

    if (!req.session || !req.session.user) {
        res.send('forbidden!登录后才可执行该操作');
        return;
    }
    var host = req.headers.host;
    var file = req.files.userfile;

    if (file) {
        var name = file.name;
        var ext = name.substr(name.lastIndexOf('.'), 4);
        var uid = req.session.user.id.toString();
        var time = new Date().getTime();
        var new_name = uid + time + ext;
        var userDir = path.join(upload_path, uid);
        ndir.mkdir(userDir, function(err) {
            if (err)
                return next(err);
            var new_path = path.join(userDir, new_name);
            fs.rename(file.path, new_path, function(err) {
                if (err) {
                    return next(err);
                }

                // ueditor有提供相对路径到绝对路径的转化
                //var url = 'http://' + host + '/user_data/images/' + uid + '/' + new_name;//使用绝对路径，image.html的insertBatch方法中使用tmpObj.data_ue_src = tmpObj.src =ci.url;
                var url = '/user_data/images/' + uid + '/' + new_name;//使用相对路径，image.html的insertBatch方法中使用tmpObj.data_ue_src = tmpObj.src =ci.url;
                
                res.json({// 严格此格式，否则ueditor会发生乱七八糟错误
                    state : 'SUCCESS',
                    url : url,
                    title : ''
                });
                return;
            });
        });
    }
    else {
        res.json({
            state : 'failed'
        });
        return;
    }
};
