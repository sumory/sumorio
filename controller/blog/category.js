var async = require('async');
var sanitize = require('validator').sanitize;
var mysql = require('../../lib/mysql.js');
var common = require('../common/common.js');

/**
 * 得到用户的所有文章分类
 * 
 * @param user_id
 * @param callback
 */
function get_all_categories(user_id, callback) {
    mysql.query('select * from category where user_id = ? order by sequence asc', [ user_id ], function(err, categories) {
        if (err) {
            callback(err, []);
        }
        callback(err, categories);
        return;
    });
};

/**
 * 得到某一文章分类
 * 
 * @param user_id
 * @param category_id
 * @param callback
 */
function get_category(category_id, callback) {
    mysql.queryOne('select * from category where id =?', [category_id ], function(err, category) {
        if (err) {
            callback(err, {});
        }
        callback(err, category);
        return;
    });
};

exports.get_all_categories = get_all_categories;
exports.get_category = get_category;





/**
 * 点击编辑所有分类
 * 
 * @param req
 * @param res
 * @param next
 */
exports.edit_categories = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }
    get_all_categories(req.session.user.id,function(err,categories){
        if(err || !categories){
            cb(null,[]);
        }
        else{
            res.render('category/edit_all', {
                categories : categories
            });
            return;
        }
    });
};

/**
 * 点击一个分类进行编辑
 * 
 * @param req
 * @param res
 * @param next
 */
exports.edit_category = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var category_id = req.params.category_id;

    get_category(category_id, function(err, category){
        if(err){
            res.render('category/edit', {
                category : {},
                categories : []
            });
            return;
        }
        else{
            get_all_categories(user_id, function(err,categories){
                if(err || !categories){
                    res.render('category/edit', {
                        category : {},
                        categories : []
                    });
                    return;
                }
                else{
                    res.render('category/edit', {
                        category : category,
                        categories : categories
                    });
                    return;
                }
            });
        }
    });  
};

/**
 * 修改一个分类
 * 
 * @param req
 * @param res
 * @param next
 */
exports.modify_category = function(req, res, next) {
    if (!req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var category_id = req.params.category_id;

    async.parallel({// 并行执行
        categories : function(cb){
            get_all_categories(user_id,function(err,categories){
                if(err || !categories){
                    cb(null,[]);
                }
                else{
                    cb(null,categories);
                }
            });
        },
        info : function(cb) {// 编辑分类
            var name = sanitize(req.body.name).trim();
            name = sanitize(name).xss();
            var sequence = req.body.sequence;
            mysql.update('update category set name=?, sequence=? where user_id = ? and id = ?', [ name, sequence, user_id, category_id ], function(err, info) {
                if (err) {
                    res.render('notify/notify', {
                        error : '修改文章分类发生错误'
                    });
                    return;
                }
                cb(null, info);
            });
        },

    }, function(err, data) {// 并行完成后最终执行
        if (err) {
            res.render('notify/notify', {
                error : '修改分类出错'
            });
            return;
        }
        else{
            res.render('category/edit_all', {
                categories : data.categories
            });
            return;
        }
    });
};

/**
 * 添加一个文章分类
 * 
 * @param req
 * @param res
 * @param next
 */
exports.add_category = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();

    var sequence = req.body.sequence;

    if (name == '') {
        res.render('notify/notify', {
            error : '信息不完整。'
        });
        return;
    }

    mysql.insert('insert into category(name,sequence,user_id) values(?,?,?)', [ name, sequence, req.session.user.id ], function(err, info) {
        if (err) {
            res.render('notify/notify', {
                error : '添加分类出错'
            });
            return;
        }
        res.redirect('/categories/edit');
    });
};

/**
 * 删除一个文章分类
 * 
 * @param req
 * @param res
 * @param next
 */
exports.delete_category = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.render('notify/notify', {
            error : '你还没有登录。'
        });
        return;
    }

    var user_id = req.session.user.id;
    var category_id = req.params.category_id;

    mysql.query('select * from archive_category where category_id = ?', [ category_id ], function(err, kvs) {
        if (err) {
            res.render('notify/notify', {
                error : '删除分类时解除文章关系出错'
            });
            return;
        }
        if (kvs && kvs.length > 0) {
            res.render('notify/notify', {
                error : ' 删除分类时请先把该分类下文章移到其它分类下'
            });
            return;
        }
        mysql.update('delete from category where id=? and user_id=?', [ category_id, user_id ], function(err, info) {
            if (err) {
                res.render('notify/notify', {
                    error : '删除分类出错'
                });
                return;
            }
            res.redirect('/categories/edit');
        });
    });
};
