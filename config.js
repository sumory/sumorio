exports.config = {
	name : 'sumorio',
	description : 'sumorio 是基于Node.js开发的社区, 您也可以把它当做博客系统使用.',
	host : 'http://127.0.0.1',
	session_secret : 'sumorio_secret',
	auth_cookie_name : 'sumorio_secret',
	app_port : 8080,
	version : '0.1 beta',

	//logfiles directory
	logDirectory : __dirname + "/logs/",

	// mysql config
	server : "localhost",
	port : 3306,
	user : "root",
	password : "",
	database : "sumorio",
	maxSockets : 80,//pool使用
	timeout : 1,//pool使用
	
	admins: {sumory:true}
};
