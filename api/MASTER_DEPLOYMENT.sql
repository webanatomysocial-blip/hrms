SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'employee',
  `manager_id` int(11) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `permissions` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `entry_type` varchar(10) NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `notes` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `daily_attendance_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `total_working_hours` decimal(10,2) DEFAULT 0.00,
  `total_break_time` decimal(10,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'present',
  `first_clock_in` time DEFAULT NULL,
  `last_clock_out` time DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `status_detail` varchar(50) DEFAULT 'pending',
  `is_unpaid` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `manager_approved_by` int(11) DEFAULT NULL,
  `manager_approved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(50) DEFAULT 'public',
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `target` varchar(50) DEFAULT 'all',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `attachment_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `monthly_payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `paid_leaves` decimal(10,2) DEFAULT 0.00,
  `unpaid_leaves` decimal(10,2) DEFAULT 0.00,
  `deductions_amount` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'draft',
  `processed_at` datetime DEFAULT NULL,
  `overtime_hours` int(11) DEFAULT 0,
  `overtime_pay` decimal(10,2) DEFAULT 0.00,
  `bonus` decimal(10,2) DEFAULT 0.00,
  `is_finalized` tinyint(1) DEFAULT 0,
  `basic_salary` decimal(10,2) DEFAULT 0.00,
  `hra` decimal(10,2) DEFAULT 0.00,
  `lta` decimal(10,2) DEFAULT 0.00,
  `special_allowance` decimal(10,2) DEFAULT 0.00,
  `pf_contribution` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `help_desk_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` varchar(20) DEFAULT 'medium',
  `category` varchar(50) DEFAULT 'general',
  `status` varchar(20) DEFAULT 'open',
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `help_desk_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `revoked` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `context` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `attempts` int(11) DEFAULT 0,
  `last_attempt` datetime DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `leave_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` int(11) NOT NULL,
  `sl` decimal(5,2) DEFAULT 0.00,
  `cl` decimal(5,2) DEFAULT 0.00,
  `pl` decimal(5,2) DEFAULT 0.00,
  `used_sl` decimal(5,2) DEFAULT 0.00,
  `used_cl` decimal(5,2) DEFAULT 0.00,
  `used_pl` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `emp_year_quarter` (`employee_id`, `year`, `quarter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rule_key` varchar(50) NOT NULL,
  `rule_value` varchar(255) NOT NULL,
  `description` text,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rule_key` (`rule_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `salary_structures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `ctc` decimal(15,2) NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `hra` decimal(15,2) NOT NULL,
  `special_allowance` decimal(15,2) NOT NULL,
  `lta` decimal(15,2) DEFAULT 0.00,
  `pf_contribution` decimal(15,2) DEFAULT 0.00,
  `professional_tax` decimal(15,2) DEFAULT 0.00,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO attendance VALUES(8,19,'Supraja','2025-10-11','17:05:00','in','session_68ea40e447e655.68573780',NULL,'49.205.250.253','2025-10-11 11:35:00');
INSERT INTO attendance VALUES(9,18,'Nitish Vetcha','2026-04-08','09:43:29','in','session_69d5d5e9be17d7.73854980',NULL,'::1','2026-04-08 09:43:29');
INSERT INTO attendance VALUES(10,18,'Nitish Vetcha','2026-04-08','17:11:20','out','session_69d5d5e9be17d7.73854980',NULL,'::1','2026-04-08 17:11:20');
INSERT INTO attendance VALUES(11,18,'Nitish Vetcha','2026-04-08','17:20:17','in','session_69d640f9dda273.59225814',NULL,'::1','2026-04-08 17:20:17');
INSERT INTO attendance VALUES(12,18,'Nitish Vetcha','2026-04-08','17:20:23','out','session_69d640f9dda273.59225814',NULL,'::1','2026-04-08 17:20:23');
INSERT INTO attendance VALUES(13,18,'Nitish Vetcha','2026-04-09','15:48:33','in','session_69d77cf945e278.06428791',NULL,'::1','2026-04-09 15:48:33');
INSERT INTO attendance VALUES(14,18,'Nitish Vetcha','2026-04-09','15:48:39','out','session_69d77cf945e278.06428791',NULL,'::1','2026-04-09 15:48:39');
INSERT INTO attendance VALUES(15,18,'Nitish Vetcha','2026-04-09','15:48:40','in','session_69d77d00f1af63.28723442',NULL,'::1','2026-04-09 15:48:40');
INSERT INTO attendance VALUES(16,18,'Nitish Vetcha','2026-04-09','15:48:50','out','session_69d77d00f1af63.28723442',NULL,'::1','2026-04-09 15:48:50');
INSERT INTO attendance VALUES(17,18,'Nitish Vetcha','2026-04-09','16:26:31','in','session_69d785df5fe392.31054060',NULL,'::1','2026-04-09 16:26:31');
INSERT INTO attendance VALUES(18,18,'Nitish Vetcha','2026-04-09','16:26:38','out','session_69d785df5fe392.31054060',NULL,'::1','2026-04-09 16:26:38');
INSERT INTO attendance VALUES(19,18,'Nitish Vetcha','2026-04-09','16:52:31','in','session_69d78bf71fef56.41180099',NULL,'::1','2026-04-09 16:52:31');
INSERT INTO attendance VALUES(20,18,'Nitish Vetcha','2026-04-09','16:52:37','out','session_69d78bf71fef56.41180099',NULL,'::1','2026-04-09 16:52:37');
INSERT INTO attendance VALUES(21,18,'Nitish Vetcha','2026-04-09','17:32:14','in','session_69d795461ba136.96537297',NULL,'::1','2026-04-09 17:32:14');
INSERT INTO attendance VALUES(22,18,'Nitish Vetcha','2026-04-10','10:15:57','in','session_69d880857f4238.35971459',NULL,'::1','2026-04-10 10:15:57');
INSERT INTO attendance VALUES(23,18,'Nitish Vetcha','2026-04-10','10:16:33','out','session_69d880857f4238.35971459',NULL,'::1','2026-04-10 10:16:33');
INSERT INTO attendance VALUES(24,18,'Nitish Vetcha','2026-04-13','09:26:14','in','session_69dc695e483865.34427371',NULL,'::1','2026-04-13 09:26:14');
INSERT INTO attendance VALUES(25,18,'Nitish Vetcha','2026-04-13','10:28:55','out','session_69dc695e483865.34427371',NULL,'::1','2026-04-13 10:28:55');
INSERT INTO attendance VALUES(26,18,'Nitish Vetcha','2026-04-13','11:45:47','in','session_69dc8a13649a26.29752567',NULL,'::1','2026-04-13 11:45:47');
INSERT INTO attendance VALUES(27,18,'Nitish Vetcha','2026-04-13','12:32:50','out','session_69dc8a13649a26.29752567',NULL,'::1','2026-04-13 12:32:50');
INSERT INTO attendance VALUES(28,18,'Nitish Vetcha','2026-04-13','12:33:09','in','session_69dc952deb3ee0.89578134',NULL,'::1','2026-04-13 12:33:09');
INSERT INTO attendance VALUES(29,18,'Nitish Vetcha','2026-04-13','12:33:57','out','session_69dc952deb3ee0.89578134',NULL,'::1','2026-04-13 12:33:57');
INSERT INTO attendance VALUES(30,18,'Nitish Vetcha','2026-04-13','12:48:58','in','session_69dc98e2c1adc9.85371423',NULL,'::1','2026-04-13 12:48:58');
INSERT INTO attendance VALUES(31,18,'Nitish Vetcha','2026-04-13','12:49:40','out','session_69dc98e2c1adc9.85371423',NULL,'::1','2026-04-13 12:49:40');
INSERT INTO attendance VALUES(32,18,'Nitish Vetcha','2026-04-22','09:35:47','in','session_69e8491be49625.44403464',NULL,'::1','2026-04-22 09:35:47');
INSERT INTO attendance VALUES(33,18,'Nitish Vetcha','2026-04-22','09:39:13','out','session_69e8491be49625.44403464',NULL,'::1','2026-04-22 09:39:13');
INSERT INTO users VALUES(1,'Admin User','admin@webanatomy.in','$2y$12$YfZkryvIXQAibwkcliiWeuAJtanyxKevQxK2l9Qbz96DNkxv7ptXS','admin',NULL,'Administration','System Administrator','2025-01-01',1,'2025-10-04 11:48:13','2025-10-11 11:05:58',NULL);
INSERT INTO users VALUES(3,'Abhilash Shankeshi','abhilash.s@mosol9.in','$2y$12$H2jV3MN1/RwmygdmostesO5g1v8F4MFMiB.KnuuLNPx2NHEBLAEkS','employee',NULL,'Marketing','SEO Executive','2025-08-18',1,'2025-10-11 05:23:10','2025-10-11 05:23:10',NULL);
INSERT INTO users VALUES(4,'Nikhitha Singireddy','nikhitha.s@mosol9.in','$2y$12$ch..Uwlhoeydp8QuCEV4r.LxmbaQhK6BHlzZo2E9PJisPi04/JsHy','employee',NULL,'Development','Web Developer','2025-09-08',1,'2025-10-11 05:27:21','2025-10-11 05:27:21',NULL);
INSERT INTO users VALUES(5,'Udaya Sri Jupudi','udaya@mosol9.com','$2y$12$M1LLSEBkuE91Jk289HOv5OI05pEXHbLOZ9gWxITVjRl2brM62jw5y','employee',NULL,'Operations','Account Strategist','2024-12-31',1,'2025-10-11 05:42:33','2025-10-11 09:50:21',NULL);
INSERT INTO users VALUES(6,'Dheeraj Sai Charan Reddy','dheeraj@mosol9.com','$2y$12$bnDgka3m12bs2ew4gFTQNO5mmwJuh8BOiTwuRGkrI8Kev1EStS53q','employee',NULL,'Development','Web Developer','2024-07-27',1,'2025-10-11 05:44:43','2025-10-11 08:30:06',NULL);
INSERT INTO users VALUES(7,'K. Vishnu Priya','priya.komaravolu@mosol9.in','$2y$12$PWYbnz4JeA.kHuj0qGisKO19M9t8fqKsvTub.VIiKxoW/xXpLlYt.','employee',NULL,'Operations','Account Manager &amp; SMM','2024-07-10',1,'2025-10-11 05:49:52','2025-10-11 05:49:52',NULL);
INSERT INTO users VALUES(8,'Srujan Beerelli','srujan.beerelli@mosol9.in','$2y$12$O32RZPO3sPBAGy/UD4NGReGkLNCjcDu7uHfVTMa6dbZwPkX3H8DAW','employee',NULL,'Design','Video Editor','2025-09-16',1,'2025-10-11 09:53:16','2025-10-11 09:53:16',NULL);
INSERT INTO users VALUES(9,'Hemanth Gotru','Hemanth.gotru@mosol9.com','$2y$12$pLestQw0Pgbm3AlVJ4/kzerg3A/6Av1DzPYT5EQSp5YdyAJHlhiia','employee',NULL,'Design','UI / UX Designer','2025-04-26',1,'2025-10-11 09:55:44','2025-10-11 09:55:44',NULL);
INSERT INTO users VALUES(10,'Bhagyalatha Balda','Bhagya.balda@mosol9.com','$2y$12$Iv35fQRh3B3LYL3pZ76UPO2py5R9r066u54JJaGNwh20QcNZJ7WUy','employee',NULL,'Marketing','Performance Marketing','2025-05-05',1,'2025-10-11 09:57:53','2025-10-11 09:57:53',NULL);
INSERT INTO users VALUES(11,'Kanchu Srinivasa Rao','srinu.kanchu@mosol9.in','$2y$12$HtRFeP1AuWb6rCmNYdlzXunDXEpmqOTmrZGEkeuPt2DY.tOOHzJI2','employee',NULL,'Marketing','Performance Marketing','2025-06-09',1,'2025-10-11 09:58:38','2025-10-11 10:05:07',NULL);
INSERT INTO users VALUES(12,'Hemanth Balusupati','hemanth.b@mosol9.in','$2y$12$fhojyZZQ54i0fVCRRAsBouxqgu/0cw8XYcD/.sELFBUTpLqbS5Gua','employee',NULL,'Marketing','SEO Executive','2025-06-09',1,'2025-10-11 10:00:11','2025-10-11 10:00:11',NULL);
INSERT INTO users VALUES(13,'Aswini Sahu','aswini.suhu@mosol9.in','$2y$12$oGdc6TRmUzMOCngatydvJ.LfOsCwsWraMNSfehxKWF.FMqWdxrQ9W','employee',NULL,'Marketing','SEO Executive','2025-07-04',1,'2025-10-11 10:01:08','2025-10-11 10:01:08',NULL);
INSERT INTO users VALUES(14,'K. Subhadra Lahari','lahari.K@mosol9.in','$2y$12$TV1aZ/Hfc8OK3zdcTSt2EuGkR3sPlalKOoHhCtRePuW7xEbz8NoXG','employee',NULL,'Marketing','SEO Executive','2025-08-05',1,'2025-10-11 10:02:03','2025-10-11 10:02:03',NULL);
INSERT INTO users VALUES(15,'Navyaswi Imadabathuni','navya.i@mosol9.in','$2y$12$x7kpyRveztpuUYx28WtEHuu3V0qszXwFE5coAlN6uN0Jyw8KmJLiC','employee',NULL,'Marketing','Successwikies Founder Office','2025-08-04',1,'2025-10-11 10:56:09','2025-10-11 10:56:09',NULL);
INSERT INTO users VALUES(16,'Dhanush Reddy','dhanush.r@mosol9.in','$2y$12$KBmwKUFgoX4E9/xWFCQQcuEfYKAduFAKkojiJ128WeYenwjQEt2Om','employee',NULL,'Development','Web Developer Intern','2025-08-05',1,'2025-10-11 10:59:26','2025-10-11 10:59:26',NULL);
INSERT INTO users VALUES(17,'Vishnu Priya','v.priya.k@mosol9.in','$2y$12$C4Jin2pTSIhoLNUgnmNQBuUVyRDQhxTwsBGdkKhs47EALkc1Vp4U6','employee',NULL,'Development','v.priya.k@mosol9.in','2025-08-04',1,'2025-10-11 11:00:09','2025-10-11 11:00:09',NULL);
INSERT INTO users VALUES(18,'Nitish Vetcha','nitish.vetcha@mosol9.in','$2y$12$gpD9mPe6gXtZjLtdU1XzBeWuRrCa1SEISgULSP1rB7.UITkUakdQ.','employee',NULL,'Development','Senior Web Developer','2024-01-27',1,'2025-10-11 11:02:47','2025-10-11 11:02:47',NULL);
INSERT INTO users VALUES(19,'Supraja','supraja@mosol9.com','$2y$12$XFDsXDi5CyOMLASrxHjXNenkpQROlP9HE.4pPZKmjgK3vBVKtjUzm','employee',NULL,'Administration','CEO','2020-01-11',1,'2025-10-11 11:29:55','2025-10-11 11:29:55',NULL);
INSERT INTO users VALUES(20,'Test Automation','test.auto@webanatomy.in','$2y$12$Nqhff5Klinr3/5ZKF.wBIeluBW3rQfJWb3DPhTm8hsXT2fXQoOxZO','employee',NULL,'','QA Engineer','2026-04-08',1,'2026-04-08 03:56:15','2026-04-08 03:56:15',NULL);
INSERT INTO users VALUES(21,'Test Clock','test.clock@webanatomy.in','$2y$12$4d63N9Aw9DDnq0AYNfFKg.9smxnIKW5lKebr3kXQBNhnNCrz6wjI6','employee',NULL,'Testing','Tester','2026-04-08',1,'2026-04-08 04:24:02','2026-04-08 04:24:02',NULL);
INSERT INTO users VALUES(22,'srujan vinnakota','srujanvinnakotta@gmail.com','$2y$12$R0ha0ezg6vayD96jREx3rO4z6aGRSZZZS4Xhdl8ekRJ.V3aJBx.FO','manager',NULL,'Administration','CCC','2026-04-10',1,'2026-04-10 10:03:09','2026-04-10 10:03:09','["manage_leaves","manage_attendance"]');
INSERT INTO users VALUES(24,'Local Manager','manager@local.com','$2y$12$3L2me0S5a4QBprVBwmS95.XhzdbKzpPYs3zYq9/dkhylyUnAltcDK','employee',NULL,'','','2026-04-23',1,'2026-04-23 11:50:43','2026-04-23 11:50:43','[]');
INSERT INTO users VALUES(25,'Local Manager 2','manager2@local.com','$2y$12$n4f2gXXcVxSeMdHuNcIaAuA426kqNvo4w9V1ZW41D8Q3M2Q./coay','employee',NULL,NULL,NULL,'2026-04-23',1,'2026-04-23 11:53:09','2026-04-23 11:53:09','[]');
INSERT INTO users VALUES(26,'Final Manager','final.manager@test.com','$2y$12$zLZLItAUtHK1nwJ7xkcele.6Ud4ayDWK0BnTz3Il/dBQz.9Rl2Qo.','manager',NULL,'','','2026-04-23',1,'2026-04-23 12:02:45','2026-04-23 12:02:45','["manage_leaves","manage_attendance","manage_employees","manage_holidays"]');
INSERT INTO leave_requests VALUES(1,1,'Admin User','sick','2025-10-15','2025-10-26',12,'erys','rejected','pending',1,1,NULL,'2025-10-04 13:36:11','2025-10-04 13:35:55','2025-10-04 13:36:11',NULL,NULL);
INSERT INTO leave_requests VALUES(2,19,'Supraja','personal','2025-10-12','2025-10-13',2,'Need leave','approved','pending',1,1,NULL,'2025-10-11 11:33:53','2025-10-11 11:33:30','2025-10-11 11:33:53',NULL,NULL);
INSERT INTO leave_requests VALUES(3,18,'Nitish Vetcha','sick','2026-04-09','2026-04-10',2,'Testing system functionality','rejected','pending',0,1,NULL,'2026-04-10 15:34:27','2026-04-08 11:13:47','2026-04-08 11:13:47',NULL,NULL);
INSERT INTO leave_requests VALUES(4,18,'Nitish Vetcha','maternity','2026-04-09','2026-04-10',2,'q4t','approved','pending',1,1,NULL,'2026-04-10 15:34:23','2026-04-08 11:35:44','2026-04-08 11:35:44',NULL,NULL);
INSERT INTO leave_requests VALUES(6,18,'Nitish Vetcha','vacation','2026-04-28','2026-04-30',3,'testing','approved','pending',0,1,NULL,'2026-04-17 16:46:39','2026-04-17 11:16:09','2026-04-17 11:16:09',NULL,NULL);
INSERT INTO leave_requests VALUES(7,18,'Nitish Vetcha','vacation','2026-04-24','2026-04-25',2,'testing','approved','approved',0,1,NULL,'2026-04-23 17:43:59','2026-04-23 12:08:22','2026-04-23 12:08:22',26,'2026-04-23 17:38:36');
INSERT INTO leave_requests VALUES(8,18,'Nitish Vetcha','sick','2026-05-01','2026-05-01',1,'Test leave request for trash icon verification','pending','pending',0,NULL,NULL,NULL,'2026-04-28 10:05:51','2026-04-28 10:05:51',NULL,NULL);
INSERT INTO holidays VALUES(1,'New Year','2025-01-01','public','New Year Day','2025-10-04 11:48:13','2025-10-04 11:48:13');
INSERT INTO holidays VALUES(2,'Republic Day','2025-01-26','public','Indian Republic Day','2025-10-04 11:48:13','2025-10-04 11:48:13');
INSERT INTO holidays VALUES(3,'Holi','2025-03-14','optional','Festival of Colors','2025-10-04 11:48:13','2025-10-11 11:26:41');
INSERT INTO holidays VALUES(4,'Good Friday','2025-04-18','public','Good Friday','2025-10-04 11:48:13','2025-10-04 11:48:13');
INSERT INTO holidays VALUES(7,'Diwali','2025-10-20','public','Festival of Lights','2025-10-04 11:48:13','2025-10-04 11:48:13');
INSERT INTO holidays VALUES(8,'Christmas','2025-12-25','public','Christmas Day','2025-10-04 11:48:13','2025-10-04 11:48:13');
INSERT INTO holidays VALUES(11,'Pongal','2025-01-14','public','','2025-10-11 11:19:52','2025-10-11 11:19:52');
INSERT INTO holidays VALUES(12,'Ramzan','2025-03-31','optional','','2025-10-11 11:20:23','2025-10-11 11:20:23');
INSERT INTO holidays VALUES(14,'May Day','2025-05-01','public','','2025-10-11 11:21:06','2025-10-11 11:21:06');
INSERT INTO holidays VALUES(15,'Bakrid','2025-07-06','optional','','2025-10-11 11:21:27','2025-10-11 11:21:27');
INSERT INTO holidays VALUES(16,'Independence Day','2025-08-15','public','','2025-10-11 11:21:48','2025-10-11 11:21:48');
INSERT INTO holidays VALUES(17,'Ganesh Chaturthi','2025-08-27','public','','2025-10-11 11:22:11','2025-10-11 11:22:11');
INSERT INTO holidays VALUES(20,'Gandhi Jayanthi','2025-10-02','public','','2025-10-11 11:24:15','2025-10-11 11:24:15');
INSERT INTO holidays VALUES(21,'Dussehra','2025-10-02','public','','2025-10-11 11:24:30','2025-10-11 11:24:30');
INSERT INTO holidays VALUES(24,'Ugadi','2025-03-29','public','','2025-10-11 11:29:08','2025-10-11 11:29:08');
INSERT INTO leave_balances VALUES(0,1,2025,4,1.0,1.0,1.0,0.0,0.0,0.0);
INSERT INTO daily_attendance_summary VALUES(1,18,'Nitish Vetcha','2026-04-09',0.0100000000000000002,0.0,'half_day','15:48:33',NULL,'2026-04-09 16:23:26','2026-04-09 17:32:14');
INSERT INTO daily_attendance_summary VALUES(2,18,'Nitish Vetcha','2026-04-08',7.469999999999999752,0.0,'late','09:43:29','17:20:23','2026-04-09 16:23:26','2026-04-09 16:23:26');
INSERT INTO daily_attendance_summary VALUES(3,19,'Supraja','2025-10-11',0.0,0.0,'present','17:05:00',NULL,'2026-04-09 16:23:26','2026-04-09 16:23:26');
INSERT INTO daily_attendance_summary VALUES(9,18,'Nitish Vetcha','2026-04-10',0.0100000000000000002,0.0,'half_day','10:15:57','10:16:33','2026-04-10 10:15:57','2026-04-10 10:16:33');
INSERT INTO daily_attendance_summary VALUES(11,18,'Nitish Vetcha','2026-04-13',1.850000000000000088,0.0,'half_day','09:26:14','12:49:40','2026-04-13 09:26:14','2026-04-13 12:49:40');
INSERT INTO daily_attendance_summary VALUES(19,18,'Nitish Vetcha','2026-04-22',0.05999999999999999778,0.0,'half_day','09:35:47','09:39:13','2026-04-22 09:35:47','2026-04-22 09:39:13');
INSERT INTO daily_attendance_summary VALUES(21,1,'Admin','2026-04-30',0.0,0.0,'present',NULL,NULL,'2026-04-30 11:02:43','2026-04-30 11:02:43');
INSERT INTO announcements VALUES(1,'Welcome to HRMS 3.0','We have updated the system with a premium glass-morphism design and new shift timers. Enjoy!','announcement','all',NULL,'2026-04-27 10:10:37','2026-04-27 10:10:37');
INSERT INTO announcements VALUES(2,'Test Broadcast','Hello World','general','all',1,'2026-04-28 10:42:15','2026-04-28 10:42:15');
INSERT INTO refresh_tokens VALUES(1,1,'f6fed33cbeafa3b64424233977412b412bf6c8fcbd032fd04c5fe947493abc17','2026-05-28 11:45:27','2026-04-28 06:15:27',0);
INSERT INTO refresh_tokens VALUES(2,1,'daa4a7ac5de96a7e45666ad236c7d882e882568b7b117053d72b83a3779dfd63','2026-05-28 11:45:36','2026-04-28 06:15:36',0);
INSERT INTO refresh_tokens VALUES(3,18,'4dd6e8b92b3d77571a4c58da7a587970409dff3ec68f5131ab0283fa2a43a3d2','2026-05-28 11:48:23','2026-04-28 06:18:23',0);
INSERT INTO refresh_tokens VALUES(4,1,'bdd8af5734cf4080a5f8ae733b7b87c9473da114931b742291419e9b961cd906','2026-05-28 12:22:42','2026-04-28 06:52:42',0);
INSERT INTO refresh_tokens VALUES(5,18,'4ff9f150bd36eb61e193faf75fc6eaeb5dbd266900051b6d874b30f56c0de8e7','2026-05-28 12:26:22','2026-04-28 06:56:22',0);
INSERT INTO refresh_tokens VALUES(6,18,'d0bf1302c8f5c1eaf0d03e3bf39c47df35b94ae4320c2fa8ef21edc480ceb134','2026-05-28 14:24:03','2026-04-28 08:54:03',0);
INSERT INTO refresh_tokens VALUES(7,18,'e3515f6fb02c2ba13521e5a045e9326c20af957a19d56e98a71dc6ac0f1126bf','2026-05-28 14:40:32','2026-04-28 09:10:32',0);
INSERT INTO refresh_tokens VALUES(8,1,'8842619ff221b9fe146ac5d2f630364096c4fc5185595c0c33e9291a75a56c3c','2026-05-28 15:00:21','2026-04-28 09:30:21',0);
INSERT INTO refresh_tokens VALUES(9,18,'0198e4b5dc779208b71d926c27a1967d82a35502f62e28c21224d1cfc3aaa0c6','2026-05-28 15:08:48','2026-04-28 09:38:48',0);
INSERT INTO refresh_tokens VALUES(10,1,'f6537cfdba8d91a4f78560e30aaa3296e25c8e5a40a791209f1ad35bcafacb18','2026-05-28 15:11:34','2026-04-28 09:41:34',0);
INSERT INTO refresh_tokens VALUES(11,18,'f4c1faa66ed68c539370a3bee35e738c231f2ac04c5f34407d392ad14e644c52','2026-05-28 15:25:45','2026-04-28 09:55:45',0);
INSERT INTO refresh_tokens VALUES(12,18,'2629c15daf4bfee822e4ee3d7c94af04afc5054e788ea3c8ed99122fafc58656','2026-05-28 15:42:39','2026-04-28 10:12:39',0);
INSERT INTO refresh_tokens VALUES(13,1,'ddbc5bd15b4b55e3999b0b859bd39b14e711e5e646ad07058567e7cc27aaeb12','2026-05-28 15:46:38','2026-04-28 10:16:38',0);
INSERT INTO refresh_tokens VALUES(14,18,'7061c364d2beb038388bf4411d661f64ba68f7acf8c084f8fa645449dbe0000b','2026-05-28 15:54:48','2026-04-28 10:24:48',0);
INSERT INTO refresh_tokens VALUES(15,1,'f9099e6a553a22da912ca7b1bc63eda5c8e84475f416c1f3bf1e7788ee363f23','2026-05-28 16:11:29','2026-04-28 10:41:29',0);
INSERT INTO refresh_tokens VALUES(16,1,'093be28b5f6412d20c43597799be564d036f93215942d7c51a48f706542c878e','2026-05-28 17:40:07','2026-04-28 12:10:07',0);
INSERT INTO refresh_tokens VALUES(17,1,'2dea5c792d2f127c3761d123eb9e21aa5fbd0c49c240910f8da51798125eca61','2026-05-28 17:42:36','2026-04-28 12:12:36',0);
INSERT INTO refresh_tokens VALUES(18,18,'3b3f7285a0d9f707faba2ef6c290020103625fdc765f70e8376219b1ebbaaa6c','2026-05-28 17:43:05','2026-04-28 12:13:05',0);
INSERT INTO refresh_tokens VALUES(19,1,'c30382bc7119471b77ed29b6c1aa1ccd51e08f6a800aaa9caca75d8fc2c16067','2026-05-30 16:18:03','2026-04-30 10:48:03',0);
INSERT INTO refresh_tokens VALUES(20,1,'64afe3f9dbc5b91fccd2263ec5c3b73143b9e6f9901ed4f306907c7fcff82653','2026-05-30 16:40:36','2026-04-30 11:10:36',0);
INSERT INTO refresh_tokens VALUES(21,18,'65157fca9ada4adf75374821db3e8cf10a175b589a0c4966b64700aad936a807','2026-05-30 16:59:00','2026-04-30 11:29:00',0);
INSERT INTO refresh_tokens VALUES(22,1,'b7e932ddabeb9ba6e4fe7fe6c87201587f754b835883a1545b8cfa0a5249e885','2026-05-30 17:00:04','2026-04-30 11:30:04',0);
INSERT INTO rate_limits VALUES(35,'login_ip_127.0.0.1',2,'2026-04-30 17:00:04','2026-04-30 17:14:00');
INSERT INTO rate_limits VALUES(36,'login_email_nitish.vetcha@mosol9.in',1,'2026-04-30 16:59:00','2026-04-30 17:14:00');
INSERT INTO rate_limits VALUES(37,'login_email_admin@webanatomy.in',1,'2026-04-30 17:00:04','2026-04-30 17:15:04');
INSERT INTO audit_logs VALUES(1,NULL,'login_failed_user_not_found','127.0.0.1','{"email":"admin@webantomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 05:39:53');
INSERT INTO audit_logs VALUES(2,NULL,'login_failed_user_not_found','127.0.0.1','{"email":"admin@webantomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 05:39:59');
INSERT INTO audit_logs VALUES(3,NULL,'login_failed_user_not_found','127.0.0.1','{"email":"admin@webantomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 05:40:01');
INSERT INTO audit_logs VALUES(4,NULL,'login_failed_user_not_found','127.0.0.1','{"email":"admin@webantomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 05:40:02');
INSERT INTO audit_logs VALUES(5,NULL,'login_failed_user_not_found','127.0.0.1','{"email":"admin@webantomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 05:40:02');
INSERT INTO audit_logs VALUES(6,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 06:15:27');
INSERT INTO audit_logs VALUES(7,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 06:15:36');
INSERT INTO audit_logs VALUES(8,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 06:18:23');
INSERT INTO audit_logs VALUES(9,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 06:52:42');
INSERT INTO audit_logs VALUES(10,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 06:56:22');
INSERT INTO audit_logs VALUES(11,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 08:53:57');
INSERT INTO audit_logs VALUES(12,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 08:54:03');
INSERT INTO audit_logs VALUES(13,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 09:10:32');
INSERT INTO audit_logs VALUES(14,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 09:30:21');
INSERT INTO audit_logs VALUES(15,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 09:38:48');
INSERT INTO audit_logs VALUES(16,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 09:41:34');
INSERT INTO audit_logs VALUES(17,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 09:55:45');
INSERT INTO audit_logs VALUES(18,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 10:12:39');
INSERT INTO audit_logs VALUES(19,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 10:16:38');
INSERT INTO audit_logs VALUES(20,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 10:24:42');
INSERT INTO audit_logs VALUES(21,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 10:24:48');
INSERT INTO audit_logs VALUES(22,NULL,'login_failed_user_not_found','127.0.0.1','{"email":"admin@example.com","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 10:39:32');
INSERT INTO audit_logs VALUES(23,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 10:41:29');
INSERT INTO audit_logs VALUES(24,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 12:10:07');
INSERT INTO audit_logs VALUES(25,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 12:12:36');
INSERT INTO audit_logs VALUES(26,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-28 12:13:05');
INSERT INTO audit_logs VALUES(27,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:34:37');
INSERT INTO audit_logs VALUES(28,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:35:03');
INSERT INTO audit_logs VALUES(29,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:35:30');
INSERT INTO audit_logs VALUES(30,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:36:29');
INSERT INTO audit_logs VALUES(31,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:36:47');
INSERT INTO audit_logs VALUES(32,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:40:24');
INSERT INTO audit_logs VALUES(33,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:41:23');
INSERT INTO audit_logs VALUES(34,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:42:05');
INSERT INTO audit_logs VALUES(35,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:43:01');
INSERT INTO audit_logs VALUES(36,NULL,'login_failed_invalid_password','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:44:33');
INSERT INTO audit_logs VALUES(37,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 10:48:03');
INSERT INTO audit_logs VALUES(38,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 11:10:36');
INSERT INTO audit_logs VALUES(39,18,'login_success','127.0.0.1','{"email":"nitish.vetcha@mosol9.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 11:29:00');
INSERT INTO audit_logs VALUES(40,1,'login_success','127.0.0.1','{"email":"admin@webanatomy.in","user_agent":"Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/147.0.0.0 Safari\/537.36"}','2026-04-30 11:30:04');
INSERT INTO attendance_rules VALUES(1,'late_threshold','09:15:00','Time after which arrival is marked Late','2026-04-28 05:17:52');
INSERT INTO attendance_rules VALUES(2,'half_day_hours','4.0','Minimum hours required for a full day','2026-04-28 05:17:52');
INSERT INTO attendance_rules VALUES(3,'auto_clock_out','21:00:00','Time at which active sessions are automatically clocked out','2026-04-28 05:17:52');
INSERT INTO salary_structures VALUES(1,18,700000.0,350000.0,175000.0,133000.0,0.0,42000.0,0.0,'2026-04-28 06:15:54');
INSERT INTO expenses VALUES(1,18,'testing',10000.0,'2026-04-29','approved',NULL,'2026-04-28 05:39:39',NULL);
INSERT INTO expenses VALUES(2,18,'new update',12332.0,'2026-04-26','pending',NULL,'2026-04-28 10:01:23','api/uploads/expenses/269fbbf80827a9c2457118d179557dad.pdf');
INSERT INTO monthly_payroll VALUES(2,18,1,2026,0.0,0.0,0.0,24800.0,'generated','2026-04-28 06:53:11',0,0,0,0,300000.0,25000.0,12500.0,5000.0,5900.0);
INSERT INTO monthly_payroll VALUES(3,18,2,2026,0.0,0.0,0.0,24800.0,'generated','2026-04-28 06:53:11',0,0,0,0,300000.0,25000.0,12500.0,5000.0,5900.0);
INSERT INTO monthly_payroll VALUES(4,18,3,2026,0.0,0.0,0.0,24800.0,'generated','2026-04-28 06:53:11',0,0,0,0,300000.0,25000.0,12500.0,5000.0,5900.0);
INSERT INTO monthly_payroll VALUES(5,18,4,2026,2.0,1666.670000000000072,10000.0,33133.33000000000174,'generated','2026-04-28 06:53:11',0,0,1,0,0.0,0.0,0.0,0.0,0.0);
INSERT INTO help_desk_tickets VALUES(1,1,'Verification Ticket','Testing the system after password reset.','medium','general','open',NULL,'2026-04-30 10:48:50','2026-04-30 10:48:50');
INSERT INTO help_desk_tickets VALUES(2,18,'testing','testing','high','hardware','open',NULL,'2026-04-30 11:29:25','2026-04-30 11:29:25');
INSERT INTO help_desk_messages VALUES(1,1,1,'System check successful.',0,'2026-04-30 10:49:30');
INSERT INTO help_desk_messages VALUES(2,1,1,'rtyusrdi',0,'2026-04-30 10:54:04');
INSERT INTO help_desk_messages VALUES(3,2,1,'this is not good ',0,'2026-04-30 11:30:16');
INSERT INTO help_desk_messages VALUES(4,2,1,'try again',0,'2026-04-30 11:30:19');
INSERT INTO help_desk_messages VALUES(5,2,18,'okay will do',0,'2026-04-30 11:30:27');
