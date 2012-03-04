var log = require('../lib/log.js'), 
    mysql = require('../lib/mysql.js');



mysql.query("select * from user",function(err, rows) {
    console.log("\nthis is query1");
    if (err)
        console.log(err);
    else
        console.log(rows);
});

mysql.query("select * from user where id=?",[3],function(err, rows) {
    console.log("\nthis is query2");
    if (err)
        console.log(err);
    else
        console.log(rows);
});

mysql.query("select * from user where id >3",function(err, rows) {
    console.log("\nthis is query3");
    if (err)
        console.log(err);
    else
        console.log(rows);
});

mysql.update("update user set pwd=? where loginname=?",['china123qw','china'],function(err, info) {
    console.log("\nthis is update1")
    if (err)
        console.log(err);
    else
        console.log(info);
});

mysql.update("update user set pwd='echover' where loginname='echover'",function(err, info) {
    console.log("\nthis is update2")
    if (err)
        console.log(err);
    else
        console.log(info);
});

mysql.insert("insert into user(loginname,pwd,email,addtime) values(?,?,?,?)",['new','new','new@126.com',new Date()],function(err, info) {
    console.log("\nthis is insert:")
    if (err)
        console.log(err);
    else
        console.log(info.insertId);
});