/**
 * 封装mysql pool和基本操作
 * 查出的结果集rows不能被拦截，如不能被取出部分后传给callback
 */
var poolModule = require('generic-pool');
var config = require("../config.js").config;
var log = require('./log.js');

console.log("init pool ....");

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
        callback(null,c); // parameter order: err, resource. new in 1.0.6
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



// 封装的基本mysql操作
/**
 * 查询所有记录
 * 
 * @param query
 * @param data 参数数组，可选
 * @callback 回调函数
 */
exports.query = function(sql,data,callback) {
    if(typeof data == 'function'){//query有2个参数，分别是sql,callback
        pool.acquire(function(err, client) {
            if(err) {
                data(err);
                return;
            }
            client.query(sql,function(err, rows){
                data(err,rows);//必须有
                pool.release(client);
            });
        });
        
    }
    else{//query有三个参数，分别是sql(prepared),参数,callback
        pool.acquire(function(err, client) {
            if(err) {
                callback(err);
                return;
            }
            client.query(sql,data,function(err, rows){
                callback(err,rows);//必须有callback
                pool.release(client);
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
exports.update = function(sql, data,callback) {
    if(typeof data == 'function'){//query有2个参数，分别是sql,callback
        pool.acquire(function(err, client) {
            if(err) {
                data(err);
                return;
            }
            client.query(sql,function(err, rows){
                data(err,rows);//必须有
                pool.release(client);
            });
        });
        
    }
    else{//query有三个参数，分别是sql(prepared),参数,callback
        pool.acquire(function(err, client) {
            if(err) {
                callback(err);
                return;
            }
            client.query(sql,data,function(err, rows){
                callback(err,rows);//必须有callback
                pool.release(client);
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
exports.insert = function(sql, data,callback) {
    if(typeof data == 'function'){//query有2个参数，分别是sql,callback
        pool.acquire(function(err, client) {
            if(err) {
                data(err);
                return;
            }
            client.query(sql,function(err, info){
                data(err,info);//必须有
                pool.release(client);
            });
        });
        
    }
    else{//query有三个参数，分别是sql(prepared),参数,callback
        pool.acquire(function(err, client) {
            if(err) {
                callback(err);
                return;
            }
            client.query(sql,data,function(err, info){
                callback(err,info);//必须有callback
                pool.release(client);
            }); 
        });
    }
};


//弃用
/*
 * function QueryTask(sqlStr, cb) { this.sqlStr = sqlStr; this.cb = cb; }
 * 
 * QueryTask.prototype.load = function() { this.loadFromDB(this.sqlStr); }
 * 
 * 
 * 
 * QueryTask.prototype.loadFromDB = function(sqlStr) { var self = this;
 * pool.acquire(function(err, client) { if (err) { self.cb.call(null, err);
 * return; }
 * 
 * client.query(sqlStr, function(err, rows, fileds) { pool.release(client); if
 * (err) { var tb = { columns : [], data : [] }; self.cb.call(null, err, tb); }
 * else { var tb = rows2table(rows); self.cb.call(null, err, tb); } });
 * 
 * }); }
 * 
 * exports.load = function(sqlStr, cb) { console.log('mysql.js load');
 * console.log(sqlStr); var qt = new QueryTask(sqlStr, cb); qt.load(); }
 */
