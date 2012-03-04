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
