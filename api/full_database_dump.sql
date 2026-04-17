-- HRMS MySQL Schema
-- Host: %DB_HOST%
-- Database: %DB_NAME%

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'employee',
  `manager_id` int(11) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `attendance`
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `entry_type` enum('in','out') NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `daily_attendance_summary`
CREATE TABLE IF NOT EXISTS `daily_attendance_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `total_working_hours` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_break_time` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'present',
  `first_clock_in` time DEFAULT NULL,
  `last_clock_out` time DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_employee_date` (`employee_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `leave_requests`
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `status_detail` varchar(50) DEFAULT 'pending',
  `is_unpaid` tinyint(1) NOT NULL DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `leave_balances`
CREATE TABLE IF NOT EXISTS `leave_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` int(11) NOT NULL,
  `sl` decimal(5,2) DEFAULT 1.00,
  `cl` decimal(5,2) DEFAULT 1.00,
  `pl` decimal(5,2) DEFAULT 1.00,
  `used_sl` decimal(5,2) DEFAULT 0.00,
  `used_cl` decimal(5,2) DEFAULT 0.00,
  `used_pl` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_employee_year_quarter` (`employee_id`,`year`,`quarter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `holidays`
CREATE TABLE IF NOT EXISTS `holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'public',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `notifications`
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- End of Schema
-- HRMS Data Dump generated on 2026-04-13T13:16:24.146187
SET FOREIGN_KEY_CHECKS = 0;

-- Table data for `users` --
TRUNCATE TABLE `users`;
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (1, 'Admin User', 'admin@webanatomy.in', '$2y$10$Qx.8/kL0WnUR69iDrLueBeyrJyjeEN2iiw.j5Fjz/nX5XjiGruHfq', 'admin', NULL, 'Administration', 'System Administrator', '2025-01-01', 1, '2025-10-04 11:48:13', '2025-10-11 11:05:58');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (3, 'Abhilash Shankeshi', 'abhilash.s@mosol9.in', '$2y$12$H2jV3MN1/RwmygdmostesO5g1v8F4MFMiB.KnuuLNPx2NHEBLAEkS', 'employee', NULL, 'Marketing', 'SEO Executive', '2025-08-18', 1, '2025-10-11 05:23:10', '2025-10-11 05:23:10');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (4, 'Nikhitha Singireddy', 'nikhitha.s@mosol9.in', '$2y$12$ch..Uwlhoeydp8QuCEV4r.LxmbaQhK6BHlzZo2E9PJisPi04/JsHy', 'employee', NULL, 'Development', 'Web Developer', '2025-09-08', 1, '2025-10-11 05:27:21', '2025-10-11 05:27:21');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (5, 'Udaya Sri Jupudi', 'udaya@mosol9.com', '$2y$12$M1LLSEBkuE91Jk289HOv5OI05pEXHbLOZ9gWxITVjRl2brM62jw5y', 'employee', NULL, 'Operations', 'Account Strategist', '2024-12-31', 1, '2025-10-11 05:42:33', '2025-10-11 09:50:21');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (6, 'Dheeraj Sai Charan Reddy', 'dheeraj@mosol9.com', '$2y$12$bnDgka3m12bs2ew4gFTQNO5mmwJuh8BOiTwuRGkrI8Kev1EStS53q', 'employee', NULL, 'Development', 'Web Developer', '2024-07-27', 1, '2025-10-11 05:44:43', '2025-10-11 08:30:06');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (7, 'K. Vishnu Priya', 'priya.komaravolu@mosol9.in', '$2y$12$PWYbnz4JeA.kHuj0qGisKO19M9t8fqKsvTub.VIiKxoW/xXpLlYt.', 'employee', NULL, 'Operations', 'Account Manager &amp; SMM', '2024-07-10', 1, '2025-10-11 05:49:52', '2025-10-11 05:49:52');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (8, 'Srujan Beerelli', 'srujan.beerelli@mosol9.in', '$2y$12$O32RZPO3sPBAGy/UD4NGReGkLNCjcDu7uHfVTMa6dbZwPkX3H8DAW', 'employee', NULL, 'Design', 'Video Editor', '2025-09-16', 1, '2025-10-11 09:53:16', '2025-10-11 09:53:16');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (9, 'Hemanth Gotru', 'Hemanth.gotru@mosol9.com', '$2y$12$pLestQw0Pgbm3AlVJ4/kzerg3A/6Av1DzPYT5EQSp5YdyAJHlhiia', 'employee', NULL, 'Design', 'UI / UX Designer', '2025-04-26', 1, '2025-10-11 09:55:44', '2025-10-11 09:55:44');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (10, 'Bhagyalatha Balda', 'Bhagya.balda@mosol9.com', '$2y$12$Iv35fQRh3B3LYL3pZ76UPO2py5R9r066u54JJaGNwh20QcNZJ7WUy', 'employee', NULL, 'Marketing', 'Performance Marketing', '2025-05-05', 1, '2025-10-11 09:57:53', '2025-10-11 09:57:53');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (11, 'Kanchu Srinivasa Rao', 'srinu.kanchu@mosol9.in', '$2y$12$HtRFeP1AuWb6rCmNYdlzXunDXEpmqOTmrZGEkeuPt2DY.tOOHzJI2', 'employee', NULL, 'Marketing', 'Performance Marketing', '2025-06-09', 1, '2025-10-11 09:58:38', '2025-10-11 10:05:07');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (12, 'Hemanth Balusupati', 'hemanth.b@mosol9.in', '$2y$12$fhojyZZQ54i0fVCRRAsBouxqgu/0cw8XYcD/.sELFBUTpLqbS5Gua', 'employee', NULL, 'Marketing', 'SEO Executive', '2025-06-09', 1, '2025-10-11 10:00:11', '2025-10-11 10:00:11');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (13, 'Aswini Sahu', 'aswini.suhu@mosol9.in', '$2y$12$oGdc6TRmUzMOCngatydvJ.LfOsCwsWraMNSfehxKWF.FMqWdxrQ9W', 'employee', NULL, 'Marketing', 'SEO Executive', '2025-07-04', 1, '2025-10-11 10:01:08', '2025-10-11 10:01:08');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (14, 'K. Subhadra Lahari', 'lahari.K@mosol9.in', '$2y$12$TV1aZ/Hfc8OK3zdcTSt2EuGkR3sPlalKOoHhCtRePuW7xEbz8NoXG', 'employee', NULL, 'Marketing', 'SEO Executive', '2025-08-05', 1, '2025-10-11 10:02:03', '2025-10-11 10:02:03');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (15, 'Navyaswi Imadabathuni', 'navya.i@mosol9.in', '$2y$12$x7kpyRveztpuUYx28WtEHuu3V0qszXwFE5coAlN6uN0Jyw8KmJLiC', 'employee', NULL, 'Marketing', 'Successwikies Founder Office', '2025-08-04', 1, '2025-10-11 10:56:09', '2025-10-11 10:56:09');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (16, 'Dhanush Reddy', 'dhanush.r@mosol9.in', '$2y$12$KBmwKUFgoX4E9/xWFCQQcuEfYKAduFAKkojiJ128WeYenwjQEt2Om', 'employee', NULL, 'Development', 'Web Developer Intern', '2025-08-05', 1, '2025-10-11 10:59:26', '2025-10-11 10:59:26');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (17, 'Vishnu Priya', 'v.priya.k@mosol9.in', '$2y$12$C4Jin2pTSIhoLNUgnmNQBuUVyRDQhxTwsBGdkKhs47EALkc1Vp4U6', 'employee', NULL, 'Development', 'v.priya.k@mosol9.in', '2025-08-04', 1, '2025-10-11 11:00:09', '2025-10-11 11:00:09');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (18, 'Nitish Vetcha', 'nitish.vetcha@mosol9.in', '$2y$12$gpD9mPe6gXtZjLtdU1XzBeWuRrCa1SEISgULSP1rB7.UITkUakdQ.', 'employee', NULL, 'Development', 'Senior Web Developer', '2024-01-27', 1, '2025-10-11 11:02:47', '2025-10-11 11:02:47');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (19, 'Supraja', 'supraja@mosol9.com', '$2y$12$XFDsXDi5CyOMLASrxHjXNenkpQROlP9HE.4pPZKmjgK3vBVKtjUzm', 'employee', NULL, 'Administration', 'CEO', '2020-01-11', 1, '2025-10-11 11:29:55', '2025-10-11 11:29:55');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (20, 'Test Automation', 'test.auto@webanatomy.in', '$2y$12$Nqhff5Klinr3/5ZKF.wBIeluBW3rQfJWb3DPhTm8hsXT2fXQoOxZO', 'employee', NULL, '', 'QA Engineer', '2026-04-08', 1, '2026-04-08 03:56:15', '2026-04-08 03:56:15');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (21, 'Test Clock', 'test.clock@webanatomy.in', '$2y$12$4d63N9Aw9DDnq0AYNfFKg.9smxnIKW5lKebr3kXQBNhnNCrz6wjI6', 'employee', NULL, 'Testing', 'Tester', '2026-04-08', 1, '2026-04-08 04:24:02', '2026-04-08 04:24:02');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES (22, 'srujan vinnakota', 'srujanvinnakotta@gmail.com', '$2y$12$ogasJSGOt5unpuo0p2BFrOxHYODvvJ2HCDBNRmILWauEO2niJkLgO', 'admin', NULL, 'Administration', 'CCC', '2026-04-10', 1, '2026-04-10 10:03:09', '2026-04-10 10:03:09');

-- Table data for `attendance` --
TRUNCATE TABLE `attendance`;
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (8, 19, 'Supraja', '2025-10-11', '17:05:00', 'in', 'session_68ea40e447e655.68573780', NULL, '49.205.250.253', '2025-10-11 11:35:00');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (9, 18, 'Nitish Vetcha', '2026-04-08', '09:43:29', 'in', 'session_69d5d5e9be17d7.73854980', NULL, '::1', '2026-04-08 09:43:29');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (10, 18, 'Nitish Vetcha', '2026-04-08', '17:11:20', 'out', 'session_69d5d5e9be17d7.73854980', NULL, '::1', '2026-04-08 17:11:20');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (11, 18, 'Nitish Vetcha', '2026-04-08', '17:20:17', 'in', 'session_69d640f9dda273.59225814', NULL, '::1', '2026-04-08 17:20:17');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (12, 18, 'Nitish Vetcha', '2026-04-08', '17:20:23', 'out', 'session_69d640f9dda273.59225814', NULL, '::1', '2026-04-08 17:20:23');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (13, 18, 'Nitish Vetcha', '2026-04-09', '15:48:33', 'in', 'session_69d77cf945e278.06428791', NULL, '::1', '2026-04-09 15:48:33');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (14, 18, 'Nitish Vetcha', '2026-04-09', '15:48:39', 'out', 'session_69d77cf945e278.06428791', NULL, '::1', '2026-04-09 15:48:39');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (15, 18, 'Nitish Vetcha', '2026-04-09', '15:48:40', 'in', 'session_69d77d00f1af63.28723442', NULL, '::1', '2026-04-09 15:48:40');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (16, 18, 'Nitish Vetcha', '2026-04-09', '15:48:50', 'out', 'session_69d77d00f1af63.28723442', NULL, '::1', '2026-04-09 15:48:50');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (17, 18, 'Nitish Vetcha', '2026-04-09', '16:26:31', 'in', 'session_69d785df5fe392.31054060', NULL, '::1', '2026-04-09 16:26:31');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (18, 18, 'Nitish Vetcha', '2026-04-09', '16:26:38', 'out', 'session_69d785df5fe392.31054060', NULL, '::1', '2026-04-09 16:26:38');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (19, 18, 'Nitish Vetcha', '2026-04-09', '16:52:31', 'in', 'session_69d78bf71fef56.41180099', NULL, '::1', '2026-04-09 16:52:31');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (20, 18, 'Nitish Vetcha', '2026-04-09', '16:52:37', 'out', 'session_69d78bf71fef56.41180099', NULL, '::1', '2026-04-09 16:52:37');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (21, 18, 'Nitish Vetcha', '2026-04-09', '17:32:14', 'in', 'session_69d795461ba136.96537297', NULL, '::1', '2026-04-09 17:32:14');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (22, 18, 'Nitish Vetcha', '2026-04-10', '10:15:57', 'in', 'session_69d880857f4238.35971459', NULL, '::1', '2026-04-10 10:15:57');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (23, 18, 'Nitish Vetcha', '2026-04-10', '10:16:33', 'out', 'session_69d880857f4238.35971459', NULL, '::1', '2026-04-10 10:16:33');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (24, 18, 'Nitish Vetcha', '2026-04-13', '09:26:14', 'in', 'session_69dc695e483865.34427371', NULL, '::1', '2026-04-13 09:26:14');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (25, 18, 'Nitish Vetcha', '2026-04-13', '10:28:55', 'out', 'session_69dc695e483865.34427371', NULL, '::1', '2026-04-13 10:28:55');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (26, 18, 'Nitish Vetcha', '2026-04-13', '11:45:47', 'in', 'session_69dc8a13649a26.29752567', NULL, '::1', '2026-04-13 11:45:47');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (27, 18, 'Nitish Vetcha', '2026-04-13', '12:32:50', 'out', 'session_69dc8a13649a26.29752567', NULL, '::1', '2026-04-13 12:32:50');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (28, 18, 'Nitish Vetcha', '2026-04-13', '12:33:09', 'in', 'session_69dc952deb3ee0.89578134', NULL, '::1', '2026-04-13 12:33:09');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (29, 18, 'Nitish Vetcha', '2026-04-13', '12:33:57', 'out', 'session_69dc952deb3ee0.89578134', NULL, '::1', '2026-04-13 12:33:57');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (30, 18, 'Nitish Vetcha', '2026-04-13', '12:48:58', 'in', 'session_69dc98e2c1adc9.85371423', NULL, '::1', '2026-04-13 12:48:58');
INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES (31, 18, 'Nitish Vetcha', '2026-04-13', '12:49:40', 'out', 'session_69dc98e2c1adc9.85371423', NULL, '::1', '2026-04-13 12:49:40');

-- Table data for `daily_attendance_summary` --
TRUNCATE TABLE `daily_attendance_summary`;
INSERT INTO `daily_attendance_summary` (`id`, `employee_id`, `employee_name`, `date`, `total_working_hours`, `total_break_time`, `status`, `first_clock_in`, `last_clock_out`, `created_at`, `updated_at`) VALUES (1, 18, 'Nitish Vetcha', '2026-04-09', 0.01, 0.0, 'half_day', '15:48:33', NULL, '2026-04-09 16:23:26', '2026-04-09 17:32:14');
INSERT INTO `daily_attendance_summary` (`id`, `employee_id`, `employee_name`, `date`, `total_working_hours`, `total_break_time`, `status`, `first_clock_in`, `last_clock_out`, `created_at`, `updated_at`) VALUES (2, 18, 'Nitish Vetcha', '2026-04-08', 7.47, 0.0, 'late', '09:43:29', '17:20:23', '2026-04-09 16:23:26', '2026-04-09 16:23:26');
INSERT INTO `daily_attendance_summary` (`id`, `employee_id`, `employee_name`, `date`, `total_working_hours`, `total_break_time`, `status`, `first_clock_in`, `last_clock_out`, `created_at`, `updated_at`) VALUES (3, 19, 'Supraja', '2025-10-11', 0.0, 0.0, 'present', '17:05:00', NULL, '2026-04-09 16:23:26', '2026-04-09 16:23:26');
INSERT INTO `daily_attendance_summary` (`id`, `employee_id`, `employee_name`, `date`, `total_working_hours`, `total_break_time`, `status`, `first_clock_in`, `last_clock_out`, `created_at`, `updated_at`) VALUES (9, 18, 'Nitish Vetcha', '2026-04-10', 0.01, 0.0, 'half_day', '10:15:57', '10:16:33', '2026-04-10 10:15:57', '2026-04-10 10:16:33');
INSERT INTO `daily_attendance_summary` (`id`, `employee_id`, `employee_name`, `date`, `total_working_hours`, `total_break_time`, `status`, `first_clock_in`, `last_clock_out`, `created_at`, `updated_at`) VALUES (11, 18, 'Nitish Vetcha', '2026-04-13', 1.85, 0.0, 'half_day', '09:26:14', '12:49:40', '2026-04-13 09:26:14', '2026-04-13 12:49:40');

-- Table data for `leave_requests` --
TRUNCATE TABLE `leave_requests`;
INSERT INTO `leave_requests` (`id`, `employee_id`, `employee_name`, `type`, `start_date`, `end_date`, `days`, `reason`, `status`, `status_detail`, `is_unpaid`, `approved_by`, `manager_id`, `approved_at`, `created_at`, `updated_at`) VALUES (1, 1, 'Admin User', 'sick', '2025-10-15', '2025-10-26', 12, 'erys', 'rejected', 'pending', 1, 1, NULL, '2025-10-04 13:36:11', '2025-10-04 13:35:55', '2025-10-04 13:36:11');
INSERT INTO `leave_requests` (`id`, `employee_id`, `employee_name`, `type`, `start_date`, `end_date`, `days`, `reason`, `status`, `status_detail`, `is_unpaid`, `approved_by`, `manager_id`, `approved_at`, `created_at`, `updated_at`) VALUES (2, 19, 'Supraja', 'personal', '2025-10-12', '2025-10-13', 2, 'Need leave', 'approved', 'pending', 1, 1, NULL, '2025-10-11 11:33:53', '2025-10-11 11:33:30', '2025-10-11 11:33:53');
INSERT INTO `leave_requests` (`id`, `employee_id`, `employee_name`, `type`, `start_date`, `end_date`, `days`, `reason`, `status`, `status_detail`, `is_unpaid`, `approved_by`, `manager_id`, `approved_at`, `created_at`, `updated_at`) VALUES (3, 18, 'Nitish Vetcha', 'sick', '2026-04-09', '2026-04-10', 2, 'Testing system functionality', 'rejected', 'pending', 0, 1, NULL, '2026-04-10 15:34:27', '2026-04-08 11:13:47', '2026-04-08 11:13:47');
INSERT INTO `leave_requests` (`id`, `employee_id`, `employee_name`, `type`, `start_date`, `end_date`, `days`, `reason`, `status`, `status_detail`, `is_unpaid`, `approved_by`, `manager_id`, `approved_at`, `created_at`, `updated_at`) VALUES (4, 18, 'Nitish Vetcha', 'maternity', '2026-04-09', '2026-04-10', 2, 'q4t', 'approved', 'pending', 1, 1, NULL, '2026-04-10 15:34:23', '2026-04-08 11:35:44', '2026-04-08 11:35:44');

-- Table data for `leave_balances` --
TRUNCATE TABLE `leave_balances`;
INSERT INTO `leave_balances` (`id`, `employee_id`, `year`, `quarter`, `sl`, `cl`, `pl`, `used_sl`, `used_cl`, `used_pl`) VALUES (0, 1, 2025, 4, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0);

-- Table data for `holidays` --
TRUNCATE TABLE `holidays`;
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (1, 'New Year', '2025-01-01', 'public', 'New Year Day', '2025-10-04 11:48:13', '2025-10-04 11:48:13');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (2, 'Republic Day', '2025-01-26', 'public', 'Indian Republic Day', '2025-10-04 11:48:13', '2025-10-04 11:48:13');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (3, 'Holi', '2025-03-14', 'optional', 'Festival of Colors', '2025-10-04 11:48:13', '2025-10-11 11:26:41');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (4, 'Good Friday', '2025-04-18', 'public', 'Good Friday', '2025-10-04 11:48:13', '2025-10-04 11:48:13');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (7, 'Diwali', '2025-10-20', 'public', 'Festival of Lights', '2025-10-04 11:48:13', '2025-10-04 11:48:13');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (8, 'Christmas', '2025-12-25', 'public', 'Christmas Day', '2025-10-04 11:48:13', '2025-10-04 11:48:13');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (11, 'Pongal', '2025-01-14', 'public', '', '2025-10-11 11:19:52', '2025-10-11 11:19:52');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (12, 'Ramzan', '2025-03-31', 'optional', '', '2025-10-11 11:20:23', '2025-10-11 11:20:23');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (14, 'May Day', '2025-05-01', 'public', '', '2025-10-11 11:21:06', '2025-10-11 11:21:06');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (15, 'Bakrid', '2025-07-06', 'optional', '', '2025-10-11 11:21:27', '2025-10-11 11:21:27');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (16, 'Independence Day', '2025-08-15', 'public', '', '2025-10-11 11:21:48', '2025-10-11 11:21:48');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (17, 'Ganesh Chaturthi', '2025-08-27', 'public', '', '2025-10-11 11:22:11', '2025-10-11 11:22:11');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (20, 'Gandhi Jayanthi', '2025-10-02', 'public', '', '2025-10-11 11:24:15', '2025-10-11 11:24:15');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (21, 'Dussehra', '2025-10-02', 'public', '', '2025-10-11 11:24:30', '2025-10-11 11:24:30');
INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES (24, 'Ugadi', '2025-03-29', 'public', '', '2025-10-11 11:29:08', '2025-10-11 11:29:08');

-- Table data for `notifications` --
TRUNCATE TABLE `notifications`;
-- No data found for notifications --

SET FOREIGN_KEY_CHECKS = 1;