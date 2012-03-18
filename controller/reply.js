var check = require('validator').check;
var	sanitize = require('validator').sanitize;
var async = require('async');
var Util = require('../lib/util.js');
var mysql = require('../lib/mysql.js');

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
	
	var create_at = new Date();//创建时间
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
    }, function(err, results) {
        if(err){
            res.render('notify/notify',{error:results.info});
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
	
	var reply_id = req.body.reply_id;
	mysql.update('delete from reply where id = ? and author_id = ?', [reply_id, req.session.user.id], function(err, info){
	    if(err){
	        res.json({status:'failed'});
	        return;
	    }
	    res.json({status:'success'});
	    return;
	});
};

