##Sumorio

### 介绍
sumorio是用nodejs开发的社区系统，借鉴了[nodeclub][1]的一些通用代码(注册/登录/session处理等)。目前版本为0.2.1。

### 安装部署

 - 安装mysql数据库，在docs文件夹下找到目前版本的sql文件sumorio_0.2.1.sql，导入到mysql中
 - 修改主目录下的config.js文件，修改其中的mysql及其它config为自己机器的配置(手动创建需要的路径，如*_path)
 - 安装package.json里列出的库
 - 在主目录下执行node app.js启动程序，访问http://ip:port即可
 - 默认初始化的用户名：sumory 密码：123456

### History

#### 0.2.1

* 重构代码：修改了一个表名和几个字段名；分层并独立各模块，使得后续开发更方便

#### 0.2.0

* 网盘功能：支持文件夹，私密、共享文件等
* 更改全站css，全面采用bootstrap
* 更新了很多小地方

#### 0.1.0 - 0.1.3

* 社区功能:关注等
* 消息系统:文章、关注等相关消息推送
* 图片功能
* 评论功能
* 多用户Blog

### Todo

* Feed
* 收藏
* 分页


  [1]: https://github.com/muyuan/nodeclub/