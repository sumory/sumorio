var async = require('async');
var sanitize = require('validator').sanitize;
var mysql = require('../lib/mysql.js');
var common = require('./common.js');

/**
 * 得到用户的所有文章分类
 * 
 * @param user_id
 * @param callback
 */
exports.get_all_categories = function(user_id, callback) {
    mysql.query('select * from category where user_id = ? order by sequence asc', [ user_id ], function(err, categories) {
        if (err) {
            callback(err, []);
        }
        callback(err, categories);
        return;
    });
};

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

    common.initSidebar(req.session.user.id, function(err, result) { // 获取用户页左侧sidebar数据
        if (err) {
            res.render('notify/notify', {
                error : '查找用户信息出错'
            });
            return;
        }
        res.render('category/edit_all', {
            result : result
        });
        return;
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

    async.parallel({// 并行执行
        sidebar_data : function(cb) {
            common.initSidebar(user_id, function(err, result) {// 获取左侧bar数据
                if (err) {
                    cb(err, '查找用户数据时发生错误');
                }
                cb(null, result);// 将得到的数据传递给key(sidebar_data)
            });
        },
        category : function(cb) {// 获取要编辑的分类数据
            mysql.queryOne('select * from category where user_id = ? and id = ?', [ user_id, category_id ], function(err, category) {
                if (err) {
                    cb(err, '无法获分类:' + category_id);
                }
                cb(null, category);
            });
        }
    }, function(err, data) {// 并行完成后最终执行,有一个出错则结束执行，调用此方法
        if (err) {
            var errStr = '';
            for ( var err_key in data) {
                if (typeof data[err_key] === 'string')
                    errStr += data[err_key];
            }
            res.render('notify/notify', {
                error : errStr
            });
            return;
        }
        res.render('category/edit', {
            result : data.sidebar_data,// 左侧bar数据
            category : data.category
        // 查到的要更改的category
        });
        return;
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
        sidebar_data : function(cb) {
            common.initSidebar(user_id, function(err, result) {// 获取左侧bar数据
                if (err) {
                    res.render('notify/notify', {
                        error : '查找用户数据时发生错误'
                    });
                    return;
                }
                cb(null, result);// 将得到的数据传递给key(sidebar_data)
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
        res.render('category/edit_all', {
            result : data.sidebar_data
        // 左侧bar数据(包括用户基本数据和文章分类数据，所以不用再查找所有分类)
        });
        return;
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
        console.log(kvs.length);
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
