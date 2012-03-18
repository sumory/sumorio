##Sumorio

### 介绍
sumorio是用nodejs开发的社区系统，借鉴了[nodeclub][1]的一些通用代码(注册/登录/session处理等)。目前版本为0.1.1beta，可当做多用户博客系统使用，社区功能正在开发中。当前代码还很粗陋(仅供学习使用)，将在0.2版本中完善。

### 安装部署

 - 安装mysql数据库，在docs文件夹下找到目前版本的sql文件sumorio_0.1.sql，导入到mysql中
 - 修改主目录下的config.js文件，修改其中的mysql及其它config为自己机器的配置
 - 安装package.json里列出的nodejs需要的库
 - 在主目录下执行node app.js启动程序，访问http://ip:port即可

### History

#### 0.1.1

* 上传图片功能
* 添加简单的评论功能 

#### 0.1.0

* 多用户Blog

### Todo

* 消息系统
* 关注
* 收藏



  [1]: https://github.com/muyuan/nodeclub/