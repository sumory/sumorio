/*
MySQL Data Transfer
Source Host: 192.168.20.116
Source Database: sumorio
Target Host: 192.168.20.116
Target Database: sumorio
Date: 2012/3/15 17:57:48
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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

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
-- Table structure for user
-- ----------------------------
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `loginname` varchar(30) DEFAULT '' COMMENT '用户名',
  `pwd` varchar(100) DEFAULT '',
  `email` varchar(100) DEFAULT '' COMMENT '邮箱',
  `create_at` datetime DEFAULT '1970-01-01 00:00:00',
  PRIMARY KEY (`id`),
  KEY `index_user_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
