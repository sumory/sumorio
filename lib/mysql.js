/**
 * 封装mysql pool和基本操作，todo:将pool移出，初始化只执行一次
 */

var util = require('util');
var poolModule = require('generic-pool');
var config = require("../config.js").config;
var log = require('./log.js');

console.log("init pool start..");

var pool = poolModule.Pool({
    name : 'mysql',
    create : function(callback) {
        var Client = require('mysql').Client;
        var c = new Client();
        c.host = config.server;
        c.port = config.port;
        c.user = config.user;
        c.password = config.password;
        c.database = config.database;
        callback(null, c); // parameter order: err, resource. new in 1.0.6
    },
    destroy : function(client) {
        if (client.connected) {
            try {
                client.end();
            }
            catch (err) {
                log.error('Failed to close MySQL connection: ' + err);
            }
        }
    },
    max : config.maxSockets,
    idleTimeoutMillis : config.timeout,
    log : false
});

console.log("init pool end....");

// 封装的基本mysql操作
/**
 * 查询所有记录
 * 
 * @param query
 * @param data
 *            参数数组，可选
 * @callback 回调函数
 */
exports.query = function(sql, data, callback) {
    if (util.isArray(data)) {
        pool.acquire(function(err, client) {// query有三个参数，分别是sql(prepared),参数,callback
            if (err) {
                callback(err);
                return;
            }
            client.query(sql, data, function(err, rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        });
    }
    else {
        pool.acquire(function(err, client) {// query有2个参数，分别是sql,callback
            if (err) {
                data(err);
                return;
            }
            client.query(sql, function(err, rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    data(err, null);
                    return;
                }
                data(err, rows);// 必须有
            });
        });
    }
};

/**
 * 查询记录，但只返回一条
 * 
 * @param sql
 * @param data
 * @param callback
 */
exports.queryOne = function(sql, data, callback) {
    if (util.isArray(data)) {
        pool.acquire(function(err, client) {// query有三个参数，分别是sql(prepared),参数,callback
            if (err) {
                callback(err);
                return;
            }
            client.query(sql, data, function(err, rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows[0]);// 必须有callback
            });
        });
    }
    else {
        pool.acquire(function(err, client) {// query有2个参数，分别是sql,callback
            if (err) {
                data(err);
                return;
            }
            client.query(sql, function(err, rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    data(err, null);
                    return;
                }
                data(err, rows[0]);// 必须有   
            });
        });
    }
};

/**
 * update或delete数据
 * 
 * @param query
 * @param data
 */
exports.update = function(sql, data, callback) {
    if (util.isArray(data)) {
        pool.acquire(function(err, client) {// query有三个参数，分别是sql(prepared),参数,callback
            if (err) {
                callback(err);
                return;
            }
            client.query(sql, data, function(err, rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, rows);// 必须有callback
            });
        });
    }
    else {
        pool.acquire(function(err, client) {// query有2个参数，分别是sql,callback
            if (err) {
                data(err);
                return;
            }
            client.query(sql, function(err, rows) {
                pool.release(client);
                if(err){
                    log.error(err);
                    data(err, null);
                    return;
                }
                data(err, rows);// 必须有
            });
        });
    }
};

/**
 * 插入数据，并返回最后插入的数据的id，通过info.insertId获得
 * 
 * @param insertSql
 * @param data
 */
exports.insert = function(sql, data, callback) {
    if (util.isArray(data)) {
        pool.acquire(function(err, client) {// query有三个参数，分别是sql(prepared),参数,callback
            if (err) {
                callback(err);
                return;
            }
            client.query(sql, data, function(err, info) {
                pool.release(client);
                if(err){
                    log.error(err);
                    callback(err, null);
                    return;
                }
                callback(err, info);// 必须有callback 
            });
        });
    }
    else {
        pool.acquire(function(err, client) {// query有2个参数，分别是sql,callback
            if (err) {
                data(err);
                return;
            }
            client.query(sql, function(err, info) {
                pool.release(client);
                if(err){
                    log.error(err);
                    data(err, null);
                    return;
                }
                data(err, info);// 必须有
            });
        });
    }
};

// 弃用
/*
 * function QueryTask(sqlStr, cb) { this.sqlStr = sqlStr; this.cb = cb; }
 * 
 * QueryTask.prototype.load = function() { this.loadFromDB(this.sqlStr); }
 * 
 * 
 * 
 * QueryTask.prototype.loadFromDB = function(sqlStr) { var self = this; pool.acquire(function(err, client) { if (err) { self.cb.call(null, err); return; }
 * 
 * client.query(sqlStr, function(err, rows, fileds) { pool.release(client); if (err) { var tb = { columns : [], data : [] }; self.cb.call(null, err, tb); } else { var tb =
 * rows2table(rows); self.cb.call(null, err, tb); } });
 * 
 * }); }
 * 
 * exports.load = function(sqlStr, cb) { console.log('mysql.js load'); console.log(sqlStr); var qt = new QueryTask(sqlStr, cb); qt.load(); }
 */
