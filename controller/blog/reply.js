var check = require('validator').check;
var	sanitize = require('validator').sanitize;
var async = require('async');
var Util = require('../../lib/util.js');
var mysql = require('../../lib/mysql.js');
var common = require('../common/common.js');
var memssage_ctrl = require('../message.js');

/**
 * 发布一级回复：即回复文章
 * 
 * @param req
 * @param res
 * @param next
 */
exports.create_reply = function(req,res,next){
	if(!req.session || !req.session.user){
		res.send('forbidden!须登录才可发表回复');
		return;
	}

	var content = req.body.r_content;
	var archive_id = req.params.archive_id;

	var str = sanitize(content).trim();
	if(str == ''){
		res.render('notify/notify',{error:'回复内容不能为空！'});
		return;
	}
	
	var create_at =  Util.format_date(new Date());
	async.parallel({
        info : function(cb) {
            mysql.update('insert into reply(content,author_id,archive_id,create_at,update_at) values(?,?,?,?,?)',[content, req.session.user.id, archive_id, create_at, create_at], function(err, info){
                if(err){
                    log.error('回复时出现错误');
                    cb(err, '回复时出现错误');
                }
                cb(null,null);
            });
        },
        update_reply_count : function(cb) {
            mysql.update('update archive set reply_count = reply_count+1 where id = ?',[archive_id], function(err, info){
                if(err){
                    log.error('回复时更新文章回复数出现错误');
                    cb(err, '回复时更新文章回复数出现错误');
                }
                cb(null,null);
            });
        },
        sendMessage : function(cb) {
            mysql.queryOne('select * from archive where id = ?',[archive_id], function(err, archive){
                if(!err){
                    var mbody = {};
                    mbody.from_user_id = req.session.user.id;
                    mbody.from_user_name = req.session.user.loginname;
                    mbody.archive_id = archive_id;
                    mbody.archive_title = archive.title;
                    memssage_ctrl.create_message(common.MessageType.reply, archive.author_id, JSON.stringify(mbody), function(){
                        cb(null,null);
                    });
                }
                cb(null,null);
            });
        }
    }, function(err, results) {
        if(err){
            res.render('notify/notify',{error:((results.info || '')+(results.update_reply_count || ''))});
            return;
        }
        res.redirect('/archive/'+archive_id);
    });
};

/**
 * 删除回复
 * 
 * @param req
 * @param res
 * @param next
 */
exports.delete_reply = function(req,res,next){
	if(!req.session || !req.session.user){
	    res.json({status:'failed'});
        return;
    }
	
	var archive_id = req.body.archive_id;
	var reply_id = req.body.reply_id;
	mysql.update('delete from reply where id = ? and author_id = ?', [reply_id, req.session.user.id], function(err, info){
	    if(err){
	        res.json({status:'failed'});
	        return;
	    }

        mysql.update('update archive set reply_count = reply_count-1 where id = ?',[archive_id], function(err, info){
            if(err){
                log.error('删除回复时更新文章回复数出现错误');
            }
            res.json({status:'success'});
            return;
        });
	});
};

