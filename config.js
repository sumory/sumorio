exports.config = {
	name : 'sumorio',
	description : 'sumorio 是用Node.js开发的社区软件',
	host : 'http://127.0.0.1', // host 结尾不要添加'/'
	db : 'mongodb://127.0.0.1/node_club',
	session_secret : 'sumorio_secret',
	auth_cookie_name : 'sumorio_secret',
	port : 80,
	version : '0.0.1',

	// 话题列表显示的话题数量
	list_topic_count : 20,

	// mail SMTP
	mail_port : 25,
	mail_user : 'club',
	mail_pass : 'club',
	mail_host : 'smtp.126.com',
	mail_sender : 'club@126.com',
	mail_use_authentication : true,

	//logfiles directory
	logDirectory : __dirname + "/logs/",

	// mysql config
	server : "localhost",
	port : 3306,
	user : "root",
	password : "",
	database : "sumorio",
	maxSockets : 80,
	timeout : 1
};
