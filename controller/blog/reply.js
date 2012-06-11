var check = require('validator').check;
var	sanitize = require('validator').sanitize;
var async = require('async');
var Util = require('../../lib/util.js');
var replyDao = require('../../dao/reply.js');
var articleDao = require('../../dao/article.js');
var common = require('../common/common.js');
var memssage_ctrl = require('../message/message.js');

/**
 * 回复文章
 */
exports.createReply = function(req,res,next){
	if(!req.session || !req.session.user){
		res.send('forbidden!须登录才可发表回复');
		return;
	}

	var content = req.body.r_content;
	var article_id = req.params.article_id;

	var str = sanitize(content).trim();
	if(str == ''){
		res.render('notify/notify',{error:'回复内容不能为空！'});
		return;
	}
	
	var create_at =  Util.format_date(new Date());
	async.parallel({
        info : function(cb) {
            replyDao.saveReply(content, req.session.user.id, article_id, create_at, function(err, info){
                cb(null,null);
            });
        },
        update_reply_count : function(cb) {
            articleDao.updateReplyCountOfArticle(article_id, true, function(err, info){
                cb(null,null);
            });
        },
        sendMessage : function(cb) {
            articleDao.queryArticle(article_id, function(err, article){
                if(!err){
                    var mbody = {};
                    mbody.from_user_id = req.session.user.id;
                    mbody.from_user_name = req.session.user.loginname;
                    mbody.article_id = article_id;
                    mbody.article_title = article.title;
                    memssage_ctrl.create_message(common.MessageType.reply, article.author_id, JSON.stringify(mbody), function(){
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
        res.redirect('/article/'+article_id);
    });
};

/**
 * 删除回复
 */
exports.deleteReply = function(req,res,next){
	if(!req.session || !req.session.user){
	    res.json({status:'failed'});
        return;
    }
	
	var article_id = req.body.article_id;
	var reply_id = req.body.reply_id;
	replyDao.deleteReply(req.session.user.id, reply_id, function(err, info){
	    if(err){
	        res.json({status:'failed'});
	        return;
	    }
	    articleDao.updateReplyCountOfArticle(article_id, false, function(err, info){
            res.json({status:'success'});
            return;
        });
	});
};

