-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 24, 2026 at 01:57 PM
-- Server version: 10.11.16-MariaDB-cll-lve
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mosol9srujanwhma_hrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `entry_type` enum('in','out') NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

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
(45, 7, 'K. Vishnu Priya', '2026-04-21', '15:55:49', 'out', 'session_69e750a5ef9694.71069333', NULL, '49.205.253.218', '2026-04-21 15:55:49'),
(46, 18, 'Nitish Vetcha', '2026-04-22', '13:03:24', 'in', 'session_69e879c4a17150.03854965', NULL, '49.205.253.218', '2026-04-22 13:03:24'),
(47, 16, 'Dhanush Reddy', '2026-04-22', '13:15:19', 'in', 'session_69e87c8f1a46e5.51971752', NULL, '49.205.253.218', '2026-04-22 13:15:19'),
(48, 18, 'Nitish Vetcha', '2026-04-22', '13:17:00', 'out', 'session_69e879c4a17150.03854965', NULL, '49.205.253.218', '2026-04-22 13:17:00'),
(49, 14, 'K. Subhadra Lahari', '2026-04-22', '15:01:25', 'in', 'session_69e8956d07ed67.52890472', NULL, '49.205.253.218', '2026-04-22 15:01:25'),
(50, 12, 'Hemanth Balusupati', '2026-04-23', '09:08:23', 'in', 'session_69e9942f9e7305.29705602', NULL, '49.205.253.218', '2026-04-23 09:08:23'),
(51, 27, 'Mugdha Mathukumalli', '2026-04-23', '09:09:25', 'in', 'session_69e9946d448279.38283344', NULL, '49.205.253.218', '2026-04-23 09:09:25'),
(52, 26, 'MOUMITA SAHA', '2026-04-23', '09:14:19', 'in', 'session_69e9959309ac92.76757656', NULL, '49.205.253.218', '2026-04-23 09:14:19'),
(53, 34, 'Kamal Baikani', '2026-04-23', '09:16:00', 'in', 'session_69e995f8d11483.09149753', NULL, '49.205.253.218', '2026-04-23 09:16:00'),
(54, 11, 'Kanchu Srinivasa Rao', '2026-04-23', '09:16:08', 'in', 'session_69e996005a22d0.67831439', NULL, '49.205.253.218', '2026-04-23 09:16:08'),
(55, 18, 'Nitish Vetcha', '2026-04-23', '09:16:32', 'in', 'session_69e99618cc3071.96410091', NULL, '49.205.253.218', '2026-04-23 09:16:32'),
(56, 3, 'Abhilash Shankeshi', '2026-04-23', '09:16:34', 'in', 'session_69e9961a3d44e8.39935453', NULL, '49.205.253.218', '2026-04-23 09:16:34'),
(57, 7, 'K. Vishnu Priya', '2026-04-23', '09:16:38', 'in', 'session_69e9961e3cc8f7.07966955', NULL, '49.205.253.218', '2026-04-23 09:16:38'),
(58, 10, 'Bhagyalatha Balda', '2026-04-23', '09:17:27', 'in', 'session_69e9964f2407f7.12357637', NULL, '49.205.253.218', '2026-04-23 09:17:27'),
(59, 5, 'Udaya Sri Jupudi', '2026-04-23', '09:17:45', 'in', 'session_69e99661ce4702.01587716', NULL, '49.205.253.218', '2026-04-23 09:17:45'),
(60, 30, 'Medagam Sandeep Reddy', '2026-04-23', '09:18:19', 'in', 'session_69e99683f34ab0.77347679', NULL, '49.205.253.218', '2026-04-23 09:18:19'),
(61, 4, 'Nikhitha Singireddy', '2026-04-23', '09:22:02', 'in', 'session_69e997627dea12.78385085', NULL, '49.205.253.218', '2026-04-23 09:22:02'),
(62, 31, 'Mohammad Irfan', '2026-04-23', '09:26:50', 'in', 'session_69e99882da5358.66444093', NULL, '49.205.253.218', '2026-04-23 09:26:50'),
(63, 9, 'Hemanth Gotru', '2026-04-23', '09:41:38', 'in', 'session_69e99bfa039b84.51058050', NULL, '49.205.253.218', '2026-04-23 09:41:38'),
(64, 28, 'Sanjitha Moka', '2026-04-23', '10:41:14', 'in', 'session_69e9a9f218f964.60715070', NULL, '223.230.85.176', '2026-04-23 10:41:14'),
(65, 29, 'Mudavath Rajesh', '2026-04-23', '10:42:07', 'in', 'session_69e9aa271b0797.00635972', NULL, '49.205.253.218', '2026-04-23 10:42:07'),
(66, 6, 'Dheeraj Sai Charan Reddy', '2026-04-23', '12:06:45', 'in', 'session_69e9bdfd816422.89186124', NULL, '49.37.131.198', '2026-04-23 12:06:45'),
(67, 33, 'Naveen Reddy', '2026-04-23', '12:11:42', 'in', 'session_69e9bf262e4de3.43269838', NULL, '49.205.253.218', '2026-04-23 12:11:42'),
(68, 14, 'K. Subhadra Lahari', '2026-04-23', '14:14:29', 'in', 'session_69e9dbed1cd1d1.50236096', NULL, '49.205.253.218', '2026-04-23 14:14:29'),
(69, 18, 'Nitish Vetcha', '2026-04-23', '17:12:51', 'out', 'session_69e99618cc3071.96410091', NULL, '49.205.253.218', '2026-04-23 17:12:51'),
(70, 18, 'Nitish Vetcha', '2026-04-23', '17:13:08', 'in', 'session_69ea05ccc60c63.87492717', NULL, '49.205.253.218', '2026-04-23 17:13:08'),
(71, 34, 'Kamal Baikani', '2026-04-23', '18:06:24', 'out', 'session_69e995f8d11483.09149753', NULL, '49.205.253.218', '2026-04-23 18:06:24'),
(72, 26, 'MOUMITA SAHA', '2026-04-23', '18:08:35', 'out', 'session_69e9959309ac92.76757656', NULL, '49.205.253.218', '2026-04-23 18:08:35'),
(73, 11, 'Kanchu Srinivasa Rao', '2026-04-23', '18:09:06', 'out', 'session_69e996005a22d0.67831439', NULL, '49.205.253.218', '2026-04-23 18:09:06'),
(74, 33, 'Naveen Reddy', '2026-04-23', '18:09:21', 'out', 'session_69e9bf262e4de3.43269838', NULL, '49.205.253.218', '2026-04-23 18:09:21'),
(75, 29, 'Mudavath Rajesh', '2026-04-23', '18:15:24', 'out', 'session_69e9aa271b0797.00635972', NULL, '49.205.253.218', '2026-04-23 18:15:24'),
(76, 3, 'Abhilash Shankeshi', '2026-04-23', '18:18:06', 'out', 'session_69e9961a3d44e8.39935453', NULL, '49.205.253.218', '2026-04-23 18:18:06'),
(77, 10, 'Bhagyalatha Balda', '2026-04-23', '18:21:32', 'out', 'session_69e9964f2407f7.12357637', NULL, '49.205.253.218', '2026-04-23 18:21:32'),
(78, 12, 'Hemanth Balusupati', '2026-04-23', '18:30:21', 'out', 'session_69e9942f9e7305.29705602', NULL, '49.205.253.218', '2026-04-23 18:30:21'),
(79, 30, 'Medagam Sandeep Reddy', '2026-04-23', '18:44:34', 'out', 'session_69e99683f34ab0.77347679', NULL, '49.205.253.218', '2026-04-23 18:44:34'),
(80, 18, 'Nitish Vetcha', '2026-04-23', '19:26:58', 'out', 'session_69ea05ccc60c63.87492717', NULL, '49.205.253.218', '2026-04-23 19:26:58'),
(81, 5, 'Udaya Sri Jupudi', '2026-04-23', '19:29:53', 'out', 'session_69e99661ce4702.01587716', NULL, '223.230.85.176', '2026-04-23 19:29:53'),
(82, 12, 'Hemanth Balusupati', '2026-04-24', '09:05:32', 'in', 'session_69eae504c043d5.17662685', NULL, '223.230.85.176', '2026-04-24 09:05:32'),
(83, 3, 'Abhilash Shankeshi', '2026-04-24', '09:06:41', 'in', 'session_69eae5499267f9.09432138', NULL, '49.205.253.218', '2026-04-24 09:06:41'),
(84, 33, 'Naveen Reddy', '2026-04-24', '09:06:43', 'in', 'session_69eae54be61a86.04384982', NULL, '49.205.253.218', '2026-04-24 09:06:43'),
(85, 28, 'Sanjitha Moka', '2026-04-24', '09:06:48', 'in', 'session_69eae55061c613.10498791', NULL, '223.230.85.176', '2026-04-24 09:06:48'),
(86, 34, 'Kamal Baikani', '2026-04-24', '09:07:27', 'in', 'session_69eae5773507d6.20379070', NULL, '49.205.253.218', '2026-04-24 09:07:27'),
(87, 26, 'MOUMITA SAHA', '2026-04-24', '09:14:10', 'in', 'session_69eae70a1adfe2.40558727', NULL, '49.205.253.218', '2026-04-24 09:14:10'),
(88, 14, 'K. Subhadra Lahari', '2026-04-24', '09:14:47', 'in', 'session_69eae72f7de1d2.55609112', NULL, '223.230.85.176', '2026-04-24 09:14:47'),
(89, 18, 'Nitish Vetcha', '2026-04-24', '09:20:37', 'in', 'session_69eae88dc5e3f6.37991626', NULL, '223.230.85.176', '2026-04-24 09:20:37'),
(90, 5, 'Udaya Sri Jupudi', '2026-04-24', '09:21:42', 'in', 'session_69eae8cecaf166.83553978', NULL, '223.230.85.176', '2026-04-24 09:21:42'),
(91, 27, 'Mugdha Mathukumalli', '2026-04-24', '09:23:52', 'in', 'session_69eae95017e996.68258981', NULL, '49.205.253.218', '2026-04-24 09:23:52'),
(92, 7, 'K. Vishnu Priya', '2026-04-24', '09:24:04', 'in', 'session_69eae95cd1a8e8.87974681', NULL, '49.205.253.218', '2026-04-24 09:24:04'),
(93, 4, 'Nikhitha Singireddy', '2026-04-24', '09:24:09', 'in', 'session_69eae961cbb802.34991204', NULL, '223.230.85.176', '2026-04-24 09:24:09'),
(94, 11, 'Kanchu Srinivasa Rao', '2026-04-24', '09:25:00', 'in', 'session_69eae9944f3227.84001329', NULL, '49.205.253.218', '2026-04-24 09:25:00'),
(95, 29, 'Mudavath Rajesh', '2026-04-24', '09:27:20', 'in', 'session_69eaea2087add4.39176335', NULL, '49.205.253.218', '2026-04-24 09:27:20'),
(96, 30, 'Medagam Sandeep Reddy', '2026-04-24', '09:28:06', 'in', 'session_69eaea4e4edc32.99832747', NULL, '223.187.5.211', '2026-04-24 09:28:06'),
(97, 10, 'Bhagyalatha Balda', '2026-04-24', '09:33:30', 'in', 'session_69eaeb92abadf7.82992961', NULL, '49.205.253.218', '2026-04-24 09:33:30'),
(98, 9, 'Hemanth Gotru', '2026-04-24', '09:46:05', 'in', 'session_69eaee85584596.26357123', NULL, '49.205.253.218', '2026-04-24 09:46:05'),
(99, 6, 'Dheeraj Sai Charan Reddy', '2026-04-24', '11:58:53', 'in', 'session_69eb0da597d590.10598039', NULL, '49.37.131.46', '2026-04-24 11:58:53');

-- --------------------------------------------------------

--
-- Table structure for table `daily_attendance_summary`
--

CREATE TABLE `daily_attendance_summary` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `total_working_hours` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_break_time` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'present',
  `first_clock_in` time DEFAULT NULL,
  `last_clock_out` time DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_attendance_summary`
--

INSERT INTO `daily_attendance_summary` (`id`, `employee_id`, `employee_name`, `date`, `total_working_hours`, `total_break_time`, `status`, `first_clock_in`, `last_clock_out`, `created_at`, `updated_at`) VALUES
(1, 18, 'Nitish Vetcha', '2026-04-22', 0.23, 0.00, 'half_day', '13:03:24', '13:17:00', '2026-04-22 13:03:24', '2026-04-22 13:17:00'),
(2, 16, 'Dhanush Reddy', '2026-04-22', 0.00, 0.00, 'late', '13:15:19', NULL, '2026-04-22 13:15:19', '2026-04-22 13:15:19'),
(4, 14, 'K. Subhadra Lahari', '2026-04-22', 0.00, 0.00, 'late', '15:01:25', NULL, '2026-04-22 15:01:25', '2026-04-22 15:01:25'),
(5, 12, 'Hemanth Balusupati', '2026-04-23', 9.37, 0.00, 'present', '09:08:23', '18:30:21', '2026-04-23 09:08:23', '2026-04-23 18:30:21'),
(6, 27, 'Mugdha Mathukumalli', '2026-04-23', 0.00, 0.00, 'present', '09:09:25', NULL, '2026-04-23 09:09:25', '2026-04-23 09:09:25'),
(7, 26, 'MOUMITA SAHA', '2026-04-23', 8.90, 0.00, 'present', '09:14:19', '18:08:35', '2026-04-23 09:14:19', '2026-04-23 18:08:35'),
(8, 34, 'Kamal Baikani', '2026-04-23', 8.84, 0.00, 'present', '09:16:00', '18:06:24', '2026-04-23 09:16:00', '2026-04-23 18:06:24'),
(9, 11, 'Kanchu Srinivasa Rao', '2026-04-23', 8.88, 0.00, 'present', '09:16:08', '18:09:06', '2026-04-23 09:16:08', '2026-04-23 18:09:06'),
(10, 18, 'Nitish Vetcha', '2026-04-23', 10.17, 0.00, 'present', '09:16:32', '19:26:58', '2026-04-23 09:16:32', '2026-04-23 19:26:58'),
(11, 3, 'Abhilash Shankeshi', '2026-04-23', 9.03, 0.00, 'present', '09:16:34', '18:18:06', '2026-04-23 09:16:34', '2026-04-23 18:18:06'),
(12, 7, 'K. Vishnu Priya', '2026-04-23', 0.00, 0.00, 'present', '09:16:38', NULL, '2026-04-23 09:16:38', '2026-04-23 09:16:38'),
(13, 10, 'Bhagyalatha Balda', '2026-04-23', 9.07, 0.00, 'present', '09:17:27', '18:21:32', '2026-04-23 09:17:27', '2026-04-23 18:21:32'),
(14, 5, 'Udaya Sri Jupudi', '2026-04-23', 10.20, 0.00, 'present', '09:17:45', '19:29:53', '2026-04-23 09:17:45', '2026-04-23 19:29:53'),
(15, 30, 'Medagam Sandeep Reddy', '2026-04-23', 9.44, 0.00, 'present', '09:18:19', '18:44:34', '2026-04-23 09:18:19', '2026-04-23 18:44:34'),
(16, 4, 'Nikhitha Singireddy', '2026-04-23', 0.00, 0.00, 'present', '09:22:02', NULL, '2026-04-23 09:22:02', '2026-04-23 09:22:02'),
(17, 31, 'Mohammad Irfan', '2026-04-23', 0.00, 0.00, 'present', '09:26:50', NULL, '2026-04-23 09:26:50', '2026-04-23 09:26:50'),
(18, 9, 'Hemanth Gotru', '2026-04-23', 0.00, 0.00, 'late', '09:41:38', NULL, '2026-04-23 09:41:38', '2026-04-23 09:41:38'),
(19, 28, 'Sanjitha Moka', '2026-04-23', 0.00, 0.00, 'late', '10:41:14', NULL, '2026-04-23 10:41:14', '2026-04-23 10:41:14'),
(20, 29, 'Mudavath Rajesh', '2026-04-23', 7.55, 0.00, 'late', '10:42:07', '18:15:24', '2026-04-23 10:42:07', '2026-04-23 18:15:24'),
(21, 6, 'Dheeraj Sai Charan Reddy', '2026-04-23', 0.00, 0.00, 'late', '12:06:45', NULL, '2026-04-23 12:06:45', '2026-04-23 12:06:45'),
(22, 33, 'Naveen Reddy', '2026-04-23', 5.96, 0.00, 'late', '12:11:42', '18:09:21', '2026-04-23 12:11:42', '2026-04-23 18:09:21'),
(23, 14, 'K. Subhadra Lahari', '2026-04-23', 0.00, 0.00, 'late', '14:14:29', NULL, '2026-04-23 14:14:29', '2026-04-23 14:14:29'),
(37, 12, 'Hemanth Balusupati', '2026-04-24', 0.00, 0.00, 'present', '09:05:32', NULL, '2026-04-24 09:05:32', '2026-04-24 09:05:32'),
(38, 3, 'Abhilash Shankeshi', '2026-04-24', 0.00, 0.00, 'present', '09:06:41', NULL, '2026-04-24 09:06:41', '2026-04-24 09:06:41'),
(39, 33, 'Naveen Reddy', '2026-04-24', 0.00, 0.00, 'present', '09:06:43', NULL, '2026-04-24 09:06:43', '2026-04-24 09:06:43'),
(40, 28, 'Sanjitha Moka', '2026-04-24', 0.00, 0.00, 'present', '09:06:48', NULL, '2026-04-24 09:06:48', '2026-04-24 09:06:48'),
(41, 34, 'Kamal Baikani', '2026-04-24', 0.00, 0.00, 'present', '09:07:27', NULL, '2026-04-24 09:07:27', '2026-04-24 09:07:27'),
(42, 26, 'MOUMITA SAHA', '2026-04-24', 0.00, 0.00, 'present', '09:14:10', NULL, '2026-04-24 09:14:10', '2026-04-24 09:14:10'),
(43, 14, 'K. Subhadra Lahari', '2026-04-24', 0.00, 0.00, 'present', '09:14:47', NULL, '2026-04-24 09:14:47', '2026-04-24 09:14:47'),
(44, 18, 'Nitish Vetcha', '2026-04-24', 0.00, 0.00, 'present', '09:20:37', NULL, '2026-04-24 09:20:37', '2026-04-24 09:20:37'),
(45, 5, 'Udaya Sri Jupudi', '2026-04-24', 0.00, 0.00, 'present', '09:21:42', NULL, '2026-04-24 09:21:42', '2026-04-24 09:21:42'),
(46, 27, 'Mugdha Mathukumalli', '2026-04-24', 0.00, 0.00, 'present', '09:23:52', NULL, '2026-04-24 09:23:52', '2026-04-24 09:23:52'),
(47, 7, 'K. Vishnu Priya', '2026-04-24', 0.00, 0.00, 'present', '09:24:04', NULL, '2026-04-24 09:24:04', '2026-04-24 09:24:04'),
(48, 4, 'Nikhitha Singireddy', '2026-04-24', 0.00, 0.00, 'present', '09:24:09', NULL, '2026-04-24 09:24:09', '2026-04-24 09:24:09'),
(49, 11, 'Kanchu Srinivasa Rao', '2026-04-24', 0.00, 0.00, 'present', '09:25:00', NULL, '2026-04-24 09:25:00', '2026-04-24 09:25:00'),
(50, 29, 'Mudavath Rajesh', '2026-04-24', 0.00, 0.00, 'present', '09:27:20', NULL, '2026-04-24 09:27:20', '2026-04-24 09:27:20'),
(51, 30, 'Medagam Sandeep Reddy', '2026-04-24', 0.00, 0.00, 'present', '09:28:06', NULL, '2026-04-24 09:28:06', '2026-04-24 09:28:06'),
(52, 10, 'Bhagyalatha Balda', '2026-04-24', 0.00, 0.00, 'late', '09:33:30', NULL, '2026-04-24 09:33:30', '2026-04-24 09:33:30'),
(53, 9, 'Hemanth Gotru', '2026-04-24', 0.00, 0.00, 'late', '09:46:05', NULL, '2026-04-24 09:46:05', '2026-04-24 09:46:05'),
(54, 6, 'Dheeraj Sai Charan Reddy', '2026-04-24', 0.00, 0.00, 'late', '11:58:53', NULL, '2026-04-24 11:58:53', '2026-04-24 11:58:53');

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'public',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `status_detail` varchar(50) DEFAULT 'pending',
  `is_unpaid` tinyint(1) NOT NULL DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `manager_approved_by` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `manager_approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'employee',
  `permissions` text DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `permissions`, `manager_id`, `department`, `position`, `joining_date`, `active`, `created_at`, `updated_at`) VALUES
(1, 'admin@webanatomy.in', '$2y$10$Qx.8/kL0WnUR69iDrLueBeyrJyjeEN2iiw.j5Fjz/nX5XjiGruHfq', 'Admin User', 'admin', NULL, NULL, 'Administration', 'System Administrator', '2025-01-01', 1, '2025-10-04 11:48:13', '2025-10-11 11:05:58'),
(3, 'abhilash.s@mosol9.in', '$2y$12$H2jV3MN1/RwmygdmostesO5g1v8F4MFMiB.KnuuLNPx2NHEBLAEkS', 'Abhilash Shankeshi', 'employee', NULL, NULL, 'SEO', 'SEO Executive', '2025-08-18', 1, '2025-10-11 05:23:10', '2026-04-21 15:40:49'),
(4, 'nikhitha.s@mosol9.in', '$2y$12$ch..Uwlhoeydp8QuCEV4r.LxmbaQhK6BHlzZo2E9PJisPi04/JsHy', 'Nikhitha Singireddy', 'employee', NULL, NULL, 'Developers', 'Web Developer Intern', '2025-09-08', 1, '2025-10-11 05:27:21', '2026-04-22 13:09:53'),
(5, 'udaya@mosol9.com', '$2y$12$M1LLSEBkuE91Jk289HOv5OI05pEXHbLOZ9gWxITVjRl2brM62jw5y', 'Udaya Sri Jupudi', 'manager', NULL, NULL, 'Account Manager', 'Account Strategist', '2024-12-31', 1, '2025-10-11 05:42:33', '2026-04-23 18:07:10'),
(6, 'dheeraj.reddy@mosol9.com', '$2y$12$6Zx7BkMS4yy2u5X3.MeOsOsHXOE.NtMB8NvhfRwSTz/py7R6Zxfru', 'Dheeraj Sai Charan Reddy', 'employee', NULL, NULL, 'Developers', 'Web Developer', '2024-07-27', 1, '2025-10-11 05:44:43', '2026-04-23 12:05:42'),
(7, 'priya.k@mosol9.com', '$2y$12$PWYbnz4JeA.kHuj0qGisKO19M9t8fqKsvTub.VIiKxoW/xXpLlYt.', 'K. Vishnu Priya', 'manager', NULL, NULL, 'Account Manager', 'Account Manager & SMM', '2024-07-10', 1, '2025-10-11 05:49:52', '2026-04-23 18:07:01'),
(9, 'Hemanth.gotru@mosol9.com', '$2y$12$pLestQw0Pgbm3AlVJ4/kzerg3A/6Av1DzPYT5EQSp5YdyAJHlhiia', 'Hemanth Gotru', 'employee', NULL, NULL, 'Designers', 'UI / UX Designer', '2025-04-26', 1, '2025-10-11 09:55:44', '2026-04-21 15:39:24'),
(10, 'Bhagya.balda@mosol9.com', '$2y$12$Iv35fQRh3B3LYL3pZ76UPO2py5R9r066u54JJaGNwh20QcNZJ7WUy', 'Bhagyalatha Balda', 'employee', NULL, NULL, 'Performance Marketer', 'Performance Marketing', '2025-05-05', 1, '2025-10-11 09:57:53', '2026-04-21 15:39:15'),
(11, 'srinu.kanchu@mosol9.in', '$2y$12$HtRFeP1AuWb6rCmNYdlzXunDXEpmqOTmrZGEkeuPt2DY.tOOHzJI2', 'Kanchu Srinivasa Rao', 'employee', NULL, NULL, 'Performance Marketer', 'Performance Marketing', '2025-06-09', 1, '2025-10-11 09:58:38', '2026-04-21 15:39:07'),
(12, 'hemanth.b@mosol9.com', '$2y$12$cetiA1Eml.wXc0uAiUjBbubwRlunzbqiUX3UyegrigJiFEnU2iu9m', 'Hemanth Balusupati', 'employee', NULL, NULL, 'SEO', 'SEO Executive', '2025-06-09', 1, '2025-10-11 10:00:11', '2026-04-22 09:29:36'),
(14, 'lahari.K@mosol9.in', '$2y$12$TV1aZ/Hfc8OK3zdcTSt2EuGkR3sPlalKOoHhCtRePuW7xEbz8NoXG', 'K. Subhadra Lahari', 'employee', NULL, NULL, 'SEO', 'SEO Executive', '2025-08-05', 1, '2025-10-11 10:02:03', '2026-04-21 15:38:55'),
(16, 'dhanush.r@mosol9.in', '$2y$12$KBmwKUFgoX4E9/xWFCQQcuEfYKAduFAKkojiJ128WeYenwjQEt2Om', 'Dhanush Reddy', 'employee', NULL, NULL, 'Developers', 'Web Developer Intern', '2025-08-05', 1, '2025-10-11 10:59:26', '2026-04-22 13:09:07'),
(18, 'nitish.vetcha@mosol9.in', '$2y$12$gpD9mPe6gXtZjLtdU1XzBeWuRrCa1SEISgULSP1rB7.UITkUakdQ.', 'Nitish Vetcha', 'employee', NULL, NULL, 'Developers', 'Senior Web Developer', '2024-01-27', 1, '2025-10-11 11:02:47', '2026-04-22 13:08:58'),
(19, 'supraja@mosol9.com', '$2y$12$W4G34j3qZSypHoaZdycsZOYKyI85TXmm7QnyfAiESFzwgggPNT7qO', 'Supraja', 'admin', NULL, NULL, 'CEO', 'CEO', '2020-01-11', 1, '2025-10-11 11:29:55', '2026-04-22 13:17:39'),
(22, 'srujan@mosol9.com', '$2y$12$H3jpzK.3.VSTyXYFZmjCsOQPM3Y6g8qx0XsFi4ZO3N1I6A3dk0TaS', 'srujan vinnakota', 'admin', NULL, NULL, 'CMO', 'CMO', '2026-04-10', 1, '2026-04-10 10:03:09', '2026-04-22 13:17:59'),
(26, 'Moumita@Thewebanatomy.com', '$2y$12$DHoG8tS6kUOPg.S78bb9Mug7R3uNT80n15.a.sP8AHkf4yfcuFpju', 'MOUMITA SAHA', 'employee', NULL, NULL, 'Sales', 'Business Development Associate', '2026-02-02', 1, '2026-04-21 10:37:36', '2026-04-21 10:37:36'),
(27, 'mugdha.m@mosol9.in', '$2y$12$qWGE5YQLE80gClpt.z2/P.MdBDwgnV4WJOSfKbqhpHNWPHxJ.6EUe', 'Mugdha Mathukumalli', 'employee', NULL, NULL, 'SMM', 'Social Media Manager', '2025-12-15', 1, '2026-04-21 10:44:35', '2026-04-21 12:44:09'),
(28, 'sanjitha.m@mosol9.in', '$2y$12$Kwiozl8y6m2xKYH4XRy0IOLwJ06hlWnKxMTPwtRUU5zd/Er4GZzyy', 'Sanjitha Moka', 'employee', NULL, NULL, 'SuccessWikis', 'Founder\'s Office', '2025-12-22', 1, '2026-04-21 12:46:17', '2026-04-22 13:08:10'),
(29, 'rajesh.m@mosol9.com', '$2y$12$pfQGiEf7aTjzhDeRJkPdjOzr4JeupXi.R7eHFpUGtQZuknGHcejQm', 'Mudavath Rajesh', 'employee', NULL, NULL, 'SEO', 'SEO Strategist', '2025-10-27', 1, '2026-04-21 12:48:00', '2026-04-21 12:48:00'),
(30, 'sandeep.m@mosol9.in', '$2y$12$.l5HuOWHDUWmNBrld1CmMuiTtkYZo.hkOaG5XK0ZOBMAoR9OfURqK', 'Medagam Sandeep Reddy', 'employee', NULL, NULL, 'Designers', 'UI/UX Designer', '2026-01-05', 1, '2026-04-21 12:51:52', '2026-04-22 09:25:19'),
(31, 'irfan.md@mosol9.in', '$2y$12$bIqiHpcNJHdk3BfOKw10wOU9hoqE0oQb4hBBBjmC0USpv.VZlmb3.', 'Mohammad Irfan', 'employee', NULL, NULL, 'Designers', 'Video Editor', '2026-03-30', 1, '2026-04-21 12:56:29', '2026-04-22 13:07:55'),
(33, 'naveen.r@mosol9.in', '$2y$12$EtObpur2pvJeX0Q2wf1UBexyzrXV2LOcZqePnxSBeJhFXGcpIpOxq', 'Naveen Reddy', 'employee', NULL, NULL, 'Performance Marketer', 'Performance marketer Intern', '2026-04-06', 1, '2026-04-21 13:17:07', '2026-04-23 12:13:36'),
(34, 'kamal@mosol9.in', '$2y$12$ldm3umx10MRQ39XNdXh9tOQJ0xhDF6MR5pLPcYkGwjSy.s/ItvKUS', 'Kamal Baikani', 'employee', NULL, NULL, 'Designers', 'Senior Graphic Designer', '2023-11-11', 1, '2026-04-23 09:15:37', '2026-04-23 09:15:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `date` (`date`);

--
-- Indexes for table `daily_attendance_summary`
--
ALTER TABLE `daily_attendance_summary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_employee_date` (`employee_id`,`date`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `daily_attendance_summary`
--
ALTER TABLE `daily_attendance_summary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
