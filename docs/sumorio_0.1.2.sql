/*
MySQL Data Transfer
Source Host: 192.168.20.119
Source Database: sumorio
Target Host: 192.168.20.119
Target Database: sumorio
Date: 2012/3/19 12:32:08
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
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for nav
-- ----------------------------
CREATE TABLE `nav` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT '',
  `sequence` int(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `loginname` varchar(30) DEFAULT '' COMMENT '用户名',
  `pwd` varchar(100) DEFAULT '',
  `email` varchar(100) DEFAULT '' COMMENT '邮箱',
  `create_at` datetime DEFAULT '1970-01-01 00:00:00',
  `avatar` varchar(200) DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `index_user_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records 
-- ----------------------------
INSERT INTO `nav` VALUES ('5', 'java', '0');
INSERT INTO `nav` VALUES ('6', 'nodejs', '0');
INSERT INTO `nav` VALUES ('7', '系统设计', '0');
INSERT INTO `user` VALUES ('12', 'sumory', 'e10adc3949ba59abbe56e057f20f883e', 'sdf@gmail.com', '2012-03-19 03:49:06', '');
