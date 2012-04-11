var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');

exports.create_message = function (type, user_id, content, cb){
    if(typeof cb != 'function') return;
    
    var create_at = Util.format_date(new Date());
    mysql.insert('insert into message(type, user_id, content, create_at) values(?,?,?,?)', [ type, user_id, content, create_at ], function(err, info) {
        if (err) {
            log.error('发送消息失败[' + type + ',' + user_id + ',' + content + ']');
            cb(false);
        }
        cb(true);
    });
};

exports.view_messages = function (req, res, next){
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '未登录用户不能查看消息'
        });
        return;
    }
    
    var user_id = req.session.user.id;
    mysql.query('select * from message where user_id = ?', [ user_id ], function(err, messages){
        if (err) {
            res.render('notify/notify', {
                error : '查询消息发生错误'
            });
            return;
        }
        res.render('user/message',{
            messages:messages
        });
        return;
    });
};