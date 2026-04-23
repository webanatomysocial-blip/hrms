-- HRMS Final Working Production Database
-- Generated: 2026-04-22
-- Includes full data from mosol9srujanwhma_hrms.sql
-- Fixed Schema with AUTO_INCREMENT and corrected logic

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES
(1, 'admin@webanatomy.in', '$2y$10$Qx.8/kL0WnUR69iDrLueBeyrJyjeEN2iiw.j5Fjz/nX5XjiGruHfq', 'Admin User', 'admin', NULL, 'Administration', 'System Administrator', '2025-01-01', 1, '2025-10-04 11:48:13', '2025-10-11 11:05:58'),
(3, 'abhilash.s@mosol9.in', '$2y$12$H2jV3MN1/RwmygdmostesO5g1v8F4MFMiB.KnuuLNPx2NHEBLAEkS', 'Abhilash Shankeshi', 'employee', NULL, 'SEO', 'SEO Executive', '2025-08-18', 1, '2025-10-11 05:23:10', '2026-04-21 15:40:49'),
(4, 'nikhitha.s@mosol9.in', '$2y$12$ch..Uwlhoeydp8QuCEV4r.LxmbaQhK6BHlzZo2E9PJisPi04/JsHy', 'Nikhitha Singireddy', 'employee', NULL, 'Development', 'Web Developer', '2025-09-08', 1, '2025-10-11 05:27:21', '2025-10-11 05:27:21'),
(5, 'udaya@mosol9.com', '$2y$12$M1LLSEBkuE91Jk289HOv5OI05pEXHbLOZ9gWxITVjRl2brM62jw5y', 'Udaya Sri Jupudi', 'employee', NULL, 'Account Manager', 'Account Strategist', '2024-12-31', 1, '2025-10-11 05:42:33', '2026-04-21 15:36:29'),
(6, 'dheeraj@mosol9.com', '$2y$12$bnDgka3m12bs2ew4gFTQNO5mmwJuh8BOiTwuRGkrI8Kev1EStS53q', 'Dheeraj Sai Charan Reddy', 'employee', NULL, 'Development', 'Web Developer', '2024-07-27', 1, '2025-10-11 05:44:43', '2025-10-11 08:30:06'),
(7, 'priya.k@mosol9.com', '$2y$12$PWYbnz4JeA.kHuj0qGisKO19M9t8fqKsvTub.VIiKxoW/xXpLlYt.', 'K. Vishnu Priya', 'employee', NULL, 'Account Manager', 'Account Manager & SMM', '2024-07-10', 1, '2025-10-11 05:49:52', '2026-04-21 15:36:04'),
(9, 'Hemanth.gotru@mosol9.com', '$2y$12$pLestQw0Pgbm3AlVJ4/kzerg3A/6Av1DzPYT5EQSp5YdyAJHlhiia', 'Hemanth Gotru', 'employee', NULL, 'Designers', 'UI / UX Designer', '2025-04-26', 1, '2025-10-11 09:55:44', '2026-04-21 15:39:24'),
(10, 'Bhagya.balda@mosol9.com', '$2y$12$Iv35fQRh3B3LYL3pZ76UPO2py5R9r066u54JJaGNwh20QcNZJ7WUy', 'Bhagyalatha Balda', 'employee', NULL, 'Performance Marketer', 'Performance Marketing', '2025-05-05', 1, '2025-10-11 09:57:53', '2026-04-21 15:39:15'),
(11, 'srinu.kanchu@mosol9.in', '$2y$12$HtRFeP1AuWb6rCmNYdlzXunDXEpmqOTmrZGEkeuPt2DY.tOOHzJI2', 'Kanchu Srinivasa Rao', 'employee', NULL, 'Performance Marketer', 'Performance Marketing', '2025-06-09', 1, '2025-10-11 09:58:38', '2026-04-21 15:39:07'),
(12, 'hemanth.b@mosol9.com', '$2y$12$cetiA1Eml.wXc0uAiUjBbubwRlunzbqiUX3UyegrigJiFEnU2iu9m', 'Hemanth Balusupati', 'employee', NULL, 'SEO', 'SEO Executive', '2025-06-09', 1, '2025-10-11 10:00:11', '2026-04-22 09:29:36'),
(14, 'lahari.K@mosol9.in', '$2y$12$TV1aZ/Hfc8OK3zdcTSt2EuGkR3sPlalKOoHhCtRePuW7xEbz8NoXG', 'K. Subhadra Lahari', 'employee', NULL, 'SEO', 'SEO Executive', '2025-08-05', 1, '2025-10-11 10:02:03', '2026-04-21 15:38:55'),
(16, 'dhanush.r@mosol9.in', '$2y$12$KBmwKUFgoX4E9/xWFCQQcuEfYKAduFAKkojiJ128WeYenwjQEt2Om', 'Dhanush Reddy', 'employee', NULL, 'Development', 'Web Developer Intern', '2025-08-05', 1, '2025-10-11 10:59:26', '2025-10-11 10:59:26'),
(18, 'nitish.vetcha@mosol9.in', '$2y$12$gpD9mPe6gXtZjLtdU1XzBeWuRrCa1SEISgULSP1rB7.UITkUakdQ.', 'Nitish Vetcha', 'employee', NULL, 'Development', 'Senior Web Developer', '2024-01-27', 1, '2025-10-11 11:02:47', '2025-10-11 11:02:47'),
(19, 'supraja@mosol9.com', '$2y$12$XFDsXDi5CyOMLASrxHjXNenkpQROlP9HE.4pPZKmjgK3vBVKtjUzm', 'Supraja', 'employee', NULL, 'Administration', 'CEO', '2020-01-11', 1, '2025-10-11 11:29:55', '2025-10-11 11:29:55'),
(22, 'srujanvinnakotta@gmail.com', '$2y$12$ogasJSGOt5unpuo0p2BFrOxHYODvvJ2HCDBNRmILWauEO2niJkLgO', 'srujan vinnakota', 'admin', NULL, 'Administration', 'CCC', '2026-04-10', 1, '2026-04-10 10:03:09', '2026-04-10 10:03:09'),
(26, 'Moumita@Thewebanatomy.com', '$2y$12$DHoG8tS6kUOPg.S78bb9Mug7R3uNT80n15.a.sP8AHkf4yfcuFpju', 'MOUMITA SAHA', 'employee', NULL, 'Sales', 'Business Development Associate', '2026-02-02', 1, '2026-04-21 10:37:36', '2026-04-21 10:37:36'),
(27, 'mugdha.m@mosol9.in', '$2y$12$qWGE5YQLE80gClpt.z2/P.MdBDwgnV4WJOSfKbqhpHNWPHxJ.6EUe', 'Mugdha Mathukumalli', 'employee', NULL, 'SMM', 'Social Media Manager', '2025-12-15', 1, '2026-04-21 10:44:35', '2026-04-21 12:44:09'),
(28, 'sanjitha.m@mosol9.in', '$2y$12$Kwiozl8y6m2xKYH4XRy0IOLwJ06hlWnKxMTPwtRUU5zd/Er4GZzyy', 'Sanjitha Moka', 'employee', NULL, 'Successwikes', 'Founder\'s Office', '2025-12-22', 1, '2026-04-21 12:46:17', '2026-04-21 12:46:17'),
(29, 'rajesh.m@mosol9.com', '$2y$12$pfQGiEf7aTjzhDeRJkPdjOzr4JeupXi.R7eHFpUGtQZuknGHcejQm', 'Mudavath Rajesh', 'employee', NULL, 'SEO', 'SEO Strategist', '2025-10-27', 1, '2026-04-21 12:48:00', '2026-04-21 12:48:00'),
(30, 'sandeep.m@mosol9.in', '$2y$12$.l5HuOWHDUWmNBrld1CmMuiTtkYZo.hkOaG5XK0ZOBMAoR9OfURqK', 'Medagam Sandeep Reddy', 'employee', NULL, 'Designers', 'UI/UX Designer', '2026-01-05', 1, '2026-04-21 12:51:52', '2026-04-22 09:25:19'),
(31, 'irfan.md@mosol9.in', '$2y$12$bIqiHpcNJHdk3BfOKw10wOU9hoqE0oQb4hBBBjmC0USpv.VZlmb3.', 'Mohammad Irfan', 'employee', NULL, 'Successwikes', 'Video Editor', '2026-03-30', 1, '2026-04-21 12:56:29', '2026-04-22 09:30:55'),
(33, 'naveen.r@mosol9.in', '$2y$12$p39I4pPR4E1LGUUmq5KL2evyh2RFImTQ70UYXzLb6XrXnAw16woNO', 'Naveen Reddy', 'employee', NULL, 'Performance Marketer', 'Performance marketer Intern', '2026-04-06', 1, '2026-04-21 13:17:07', '2026-04-21 15:38:27');


-- --------------------------------------------------------
-- 2. Attendance Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `time`, `entry_type`, `session_id`, `notes`, `ip_address`, `created_at`) VALUES
(8, 19, 'Supraja', '2025-10-11', '17:05:00', 'in', 'session_68ea40e447e655.68573780', NULL, '49.205.250.253', '2025-10-11 11:35:00'),
(9, 18, 'Nitish Vetcha', '2026-04-08', '09:43:29', 'in', 'session_69d5d5e9be17d7.73854980', NULL, '::1', '2026-04-08 09:43:29'),
(10, 18, 'Nitish Vetcha', '2026-04-08', '17:11:20', 'out', 'session_69d5d5e9be17d7.73854980', NULL, '::1', '2026-04-08 17:11:20'),
(11, 18, 'Nitish Vetcha', '2026-04-08', '17:20:17', 'in', 'session_69d640f9dda273.59225814', NULL, '::1', '2026-04-08 17:20:17'),
(12, 18, 'Nitish Vetcha', '2026-04-08', '17:20:23', 'out', 'session_69d640f9dda273.59225814', NULL, '::1', '2026-04-08 17:20:23'),
(13, 18, 'Nitish Vetcha', '2026-04-09', '15:48:33', 'in', 'session_69d77cf945e278.06428791', NULL, '::1', '2026-04-09 15:48:33'),
(14, 18, 'Nitish Vetcha', '2026-04-09', '15:48:39', 'out', 'session_69d77cf945e278.06428791', NULL, '::1', '2026-04-09 15:48:39'),
(15, 18, 'Nitish Vetcha', '2026-04-09', '15:48:40', 'in', 'session_69d77d00f1af63.28723442', NULL, '::1', '2026-04-09 15:48:40'),
(16, 18, 'Nitish Vetcha', '2026-04-09', '15:48:50', 'out', 'session_69d77d00f1af63.28723442', NULL, '::1', '2026-04-09 15:48:50'),
(17, 18, 'Nitish Vetcha', '2026-04-09', '16:26:31', 'in', 'session_69d785df5fe392.31054060', NULL, '::1', '2026-04-09 16:26:31'),
(18, 18, 'Nitish Vetcha', '2026-04-09', '16:26:38', 'out', 'session_69d785df5fe392.31054060', NULL, '::1', '2026-04-09 16:26:38'),
(19, 18, 'Nitish Vetcha', '2026-04-09', '16:52:31', 'in', 'session_69d78bf71fef56.41180099', NULL, '::1', '2026-04-09 16:52:31'),
(20, 18, 'Nitish Vetcha', '2026-04-09', '16:52:37', 'out', 'session_69d78bf71fef56.41180099', NULL, '::1', '2026-04-09 16:52:37'),
(21, 18, 'Nitish Vetcha', '2026-04-09', '17:32:14', 'in', 'session_69d795461ba136.96537297', NULL, '::1', '2026-04-09 17:32:14'),
(22, 18, 'Nitish Vetcha', '2026-04-10', '10:15:57', 'in', 'session_69d880857f4238.35971459', NULL, '::1', '2026-04-10 10:15:57'),
(23, 18, 'Nitish Vetcha', '2026-04-10', '10:16:33', 'out', 'session_69d880857f4238.35971459', NULL, '::1', '2026-04-10 10:16:33'),
(24, 18, 'Nitish Vetcha', '2026-04-13', '09:26:14', 'in', 'session_69dc695e483865.34427371', NULL, '::1', '2026-04-13 09:26:14'),
(25, 18, 'Nitish Vetcha', '2026-04-13', '10:28:55', 'out', 'session_69dc695e483865.34427371', NULL, '::1', '2026-04-13 10:28:55'),
(26, 18, 'Nitish Vetcha', '2026-04-13', '11:45:47', 'in', 'session_69dc8a13649a26.29752567', NULL, '::1', '2026-04-13 11:45:47'),
(27, 18, 'Nitish Vetcha', '2026-04-13', '12:32:50', 'out', 'session_69dc8a13649a26.29752567', NULL, '::1', '2026-04-13 12:32:50'),
(28, 18, 'Nitish Vetcha', '2026-04-13', '12:33:09', 'in', 'session_69dc952deb3ee0.89578134', NULL, '::1', '2026-04-13 12:33:09'),
(29, 18, 'Nitish Vetcha', '2026-04-13', '12:33:57', 'out', 'session_69dc952deb3ee0.89578134', NULL, '::1', '2026-04-13 12:33:57'),
(30, 18, 'Nitish Vetcha', '2026-04-13', '12:48:58', 'in', 'session_69dc98e2c1adc9.85371423', NULL, '::1', '2026-04-13 12:48:58'),
(31, 18, 'Nitish Vetcha', '2026-04-13', '12:49:40', 'out', 'session_69dc98e2c1adc9.85371423', NULL, '::1', '2026-04-13 12:49:40'),
(32, 18, 'Nitish Vetcha', '2026-04-13', '13:19:07', 'in', 'session_69dc9ff3599ec9.67071571', NULL, '49.205.251.67', '2026-04-13 13:19:07'),
(33, 18, 'Nitish Vetcha', '2026-04-13', '13:19:24', 'out', 'session_69dc9ff3599ec9.67071571', NULL, '49.205.251.67', '2026-04-13 13:19:24'),
(34, 18, 'Nitish Vetcha', '2026-04-13', '15:27:24', 'in', 'session_69dcbe0479cd45.90274554', NULL, '49.205.251.67', '2026-04-13 15:27:24'),
(35, 18, 'Nitish Vetcha', '2026-04-13', '15:27:38', 'out', 'session_69dcbe0479cd45.90274554', NULL, '49.205.251.67', '2026-04-13 15:27:38'),
(36, 18, 'Nitish Vetcha', '2026-04-14', '12:30:11', 'in', 'session_69dde5fba91d48.08949298', NULL, '171.61.225.14', '2026-04-14 12:30:11'),
(37, 18, 'Nitish Vetcha', '2026-04-14', '12:31:42', 'out', 'session_69dde5fba91d48.08949298', NULL, '171.61.225.14', '2026-04-14 12:31:42'),
(38, 18, 'Nitish Vetcha', '2026-04-14', '12:31:45', 'in', 'session_69dde659be4444.14892258', NULL, '171.61.225.14', '2026-04-14 12:31:45'),
(39, 18, 'Nitish Vetcha', '2026-04-14', '12:31:47', 'out', 'session_69dde659be4444.14892258', NULL, '171.61.225.14', '2026-04-14 12:31:47'),
(40, 4, 'Nikhitha Singireddy', '2026-04-21', '13:25:34', 'in', 'session_69e72d762f4344.75195079', NULL, '49.205.253.218', '2026-04-21 13:25:34'),
(41, 4, 'Nikhitha Singireddy', '2026-04-21', '13:25:48', 'out', 'session_69e72d762f4344.75195079', NULL, '49.205.253.218', '2026-04-21 13:25:48'),
(42, 4, 'Nikhitha Singireddy', '2026-04-21', '13:25:50', 'in', 'session_69e72d863d1bc3.25475770', NULL, '49.205.253.218', '2026-04-21 13:25:50'),
(43, 4, 'Nikhitha Singireddy', '2026-04-21', '13:25:51', 'out', 'session_69e72d863d1bc3.25475770', NULL, '49.205.253.218', '2026-04-21 13:25:51'),
(44, 7, 'K. Vishnu Priya', '2026-04-21', '15:55:41', 'in', 'session_69e750a5ef9694.71069333', NULL, '49.205.253.218', '2026-04-21 15:55:41'),
(45, 7, 'K. Vishnu Priya', '2026-04-21', '15:55:49', 'out', 'session_69e750a5ef9694.71069333', NULL, '49.205.253.218', '2026-04-21 15:55:49');

-- --------------------------------------------------------
-- 3. Daily Attendance Summary Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `daily_attendance_summary`;
CREATE TABLE `daily_attendance_summary` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 4. Holidays Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `holidays`;
CREATE TABLE `holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'public',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `holidays` (`id`, `name`, `date`, `type`, `description`, `created_at`, `updated_at`) VALUES
(1, 'New Year', '2025-01-01', 'public', 'New Year Day', '2025-10-04 11:48:13', '2025-10-04 11:48:13'),
(2, 'Republic Day', '2025-01-26', 'public', 'Indian Republic Day', '2025-10-04 11:48:13', '2025-10-04 11:48:13'),
(3, 'Holi', '2025-03-14', 'optional', 'Festival of Colors', '2025-10-04 11:48:13', '2025-10-11 11:26:41'),
(4, 'Good Friday', '2025-04-18', 'public', 'Good Friday', '2025-10-04 11:48:13', '2025-10-04 11:48:13'),
(7, 'Diwali', '2025-10-20', 'public', 'Festival of Lights', '2025-10-04 11:48:13', '2025-10-04 11:48:13'),
(8, 'Christmas', '2025-12-25', 'public', 'Christmas Day', '2025-10-04 11:48:13', '2025-10-04 11:48:13'),
(11, 'Pongal', '2025-01-14', 'public', '', '2025-10-11 11:19:52', '2025-10-11 11:19:52'),
(12, 'Ramzan', '2025-03-31', 'optional', '', '2025-10-11 11:20:23', '2025-10-11 11:20:23'),
(14, 'May Day', '2025-05-01', 'public', '', '2025-10-11 11:21:06', '2025-10-11 11:21:06'),
(15, 'Bakrid', '2025-07-06', 'optional', '', '2025-10-11 11:21:27', '2025-10-11 11:21:27'),
(16, 'Independence Day', '2025-08-15', 'public', '', '2025-10-11 11:21:48', '2025-10-11 11:21:48'),
(17, 'Ganesh Chaturthi', '2025-08-27', 'public', '', '2025-10-11 11:22:11', '2025-10-11 11:22:11'),
(20, 'Gandhi Jayanthi', '2025-10-02', 'public', '', '2025-10-11 11:24:15', '2025-10-11 11:24:15'),
(21, 'Dussehra', '2025-10-02', 'public', '', '2025-10-11 11:24:30', '2025-10-11 11:24:30'),
(24, 'Ugadi', '2025-03-29', 'public', '', '2025-10-11 11:29:08', '2025-10-11 11:29:08');

-- --------------------------------------------------------
-- 5. Leave Requests Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
