CREATE DATABASE  IF NOT EXISTS `YOURDATABASENAME` 

USE `YOURDATABASENAME`;

DROP TABLE IF EXISTS `points`;

CREATE TABLE `points` (
  `pointId` int(11) NOT NULL,
  `status` int(11) DEFAULT '0',
  `latitude` double DEFAULT '0',
  `longitude` double DEFAULT '0',
  `heading` longtext,
  `description` longtext,
  `attribution` longtext
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;
