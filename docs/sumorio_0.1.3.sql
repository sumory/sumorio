/*
MySQL Data Transfer
Source Host: 192.168.1.116
Source Database: sumorio
Target Host: 192.168.1.116
Target Database: sumorio
Date: 2012/4/24 18:50:21
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for archive
-- ----------------------------
CREATE TABLE `archive` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT '',
  `content` varchar(20000) DEFAULT '' COMMENT 'utf8的只能接受21000多个字符(带中文)',
  `author_id` int(11) DEFAULT '0',
  `reply_count` int(11) DEFAULT '0',
  `visit_count` int(11) DEFAULT '0',
  `collect_count` int(11) DEFAULT '0',
  `create_at` datetime DEFAULT '1970-01-01 00:00:00',
  `update_at` datetime DEFAULT '1970-01-01 00:00:00',
  `last_reply` int(11) DEFAULT '0',
  `last_reply_at` datetime DEFAULT '1970-01-01 00:00:00',
  `content_is_html` int(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for archive_category
-- ----------------------------
CREATE TABLE `archive_category` (
  `archive_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for archive_nav
-- ----------------------------
CREATE TABLE `archive_nav` (
  `archive_id` int(11) DEFAULT NULL,
  `nav_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for category
-- ----------------------------
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) DEFAULT '',
  `sequence` int(4) DEFAULT '0',
  `user_id` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for follow
-- ----------------------------
CREATE TABLE `follow` (
  `user_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `create_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`,`following_id`),
  KEY `index_follow_id` (`user_id`,`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for message
-- ----------------------------
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(11) DEFAULT '0' COMMENT '消息类型',
  `user_id` int(11) DEFAULT '0' COMMENT '此条信息的接收者',
  `content` varchar(300) DEFAULT '',
  `create_at` datetime DEFAULT '1970-01-01 00:00:00',
  `is_read` bit(1) DEFAULT b'0' COMMENT '0表示未读，1表示已读',
  PRIMARY KEY (`id`),
  KEY `index_message_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for nav
-- ----------------------------
CREATE TABLE `nav` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT '',
  `sequence` int(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for reply
-- ----------------------------
CREATE TABLE `reply` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(20000) DEFAULT '',
  `archive_id` int(11) DEFAULT '0',
  `author_id` int(11) DEFAULT '0',
  `create_at` datetime DEFAULT '1970-01-01 00:00:00',
  `update_at` datetime DEFAULT '1970-01-01 00:00:00',
  `content_is_html` int(11) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `loginname` varchar(30) DEFAULT '' COMMENT '用户名',
  `pwd` varchar(100) DEFAULT '',
  `email` varchar(100) DEFAULT '' COMMENT '邮箱',
  `create_at` datetime DEFAULT '1970-01-01 00:00:00',
  `avatar` varchar(255) DEFAULT '/img/avatar.png',
  PRIMARY KEY (`id`),
  KEY `index_user_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records 
-- ----------------------------

INSERT INTO `user` VALUES ('10', 'sumory', 'e10adc3949ba59abbe56e057f20f883e', 'sumory@gg.com', '2012-03-14 10:11:55', '/img/avatar.png');
