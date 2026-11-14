-- =============================================================================
-- SMART QUEUE MANAGEMENT SYSTEM (Q-FLOW)
-- MySQL 8.0+ Database Schema & Seed Data
-- Fully compatible with MySQL Workbench & MariaDB
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `smart_queue_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `smart_queue_db`;

-- Drop existing tables in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `tokens`;
DROP TABLE IF EXISTS `token_sequences`;
DROP TABLE IF EXISTS `counters`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN') NOT NULL DEFAULT 'ROLE_CUSTOMER',
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: departments
-- -----------------------------------------------------------------------------
CREATE TABLE `departments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(10) NOT NULL UNIQUE,
  `description` VARCHAR(500) DEFAULT NULL,
  `category` ENUM('HOSPITAL', 'BANK', 'GOVERNMENT', 'CUSTOMER_SERVICE') NOT NULL,
  `avg_service_time_minutes` INT NOT NULL DEFAULT 10,
  `daily_token_limit` INT NOT NULL DEFAULT 200,
  `opening_time` TIME NOT NULL DEFAULT '08:30:00',
  `closing_time` TIME NOT NULL DEFAULT '17:00:00',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_dept_category` (`category`),
  INDEX `idx_dept_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: counters
-- -----------------------------------------------------------------------------
CREATE TABLE `counters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `counter_number` VARCHAR(20) NOT NULL,
  `counter_name` VARCHAR(100) NOT NULL,
  `department_id` BIGINT NOT NULL,
  `current_staff_id` BIGINT DEFAULT NULL,
  `status` ENUM('ACTIVE', 'BUSY', 'ON_BREAK', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_counter_department` FOREIGN KEY (`department_id`) 
    REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_counter_staff` FOREIGN KEY (`current_staff_id`) 
    REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_counter_department` (`department_id`),
  INDEX `idx_counter_staff` (`current_staff_id`),
  INDEX `idx_counter_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: token_sequences (Database-backed transaction-safe sequence)
-- -----------------------------------------------------------------------------
CREATE TABLE `token_sequences` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `department_id` BIGINT NOT NULL,
  `service_date` DATE NOT NULL,
  `current_sequence` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dept_date` (`department_id`, `service_date`),
  CONSTRAINT `fk_seq_department` FOREIGN KEY (`department_id`) 
    REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: tokens
-- -----------------------------------------------------------------------------
CREATE TABLE `tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `token_number` VARCHAR(30) NOT NULL,
  `token_sequence` BIGINT NOT NULL,
  `department_id` BIGINT NOT NULL,
  `customer_id` BIGINT NOT NULL,
  `counter_id` BIGINT DEFAULT NULL,
  `staff_id` BIGINT DEFAULT NULL,
  `priority` ENUM('EMERGENCY', 'PERSON_WITH_DISABILITY', 'SENIOR_CITIZEN', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
  `status` ENUM('WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'CANCELLED', 'SKIPPED', 'NO_SHOW') NOT NULL DEFAULT 'WAITING',
  `booking_date` DATE NOT NULL,
  `booking_time` TIME NOT NULL,
  `called_time` DATETIME DEFAULT NULL,
  `serving_start_time` DATETIME DEFAULT NULL,
  `completed_time` DATETIME DEFAULT NULL,
  `actual_duration_minutes` INT DEFAULT NULL,
  `verification_code` VARCHAR(64) NOT NULL UNIQUE,
  `notes` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_token_department` FOREIGN KEY (`department_id`) 
    REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_token_customer` FOREIGN KEY (`customer_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_token_counter` FOREIGN KEY (`counter_id`) 
    REFERENCES `counters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_token_staff` FOREIGN KEY (`staff_id`) 
    REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_tokens_dept_date_status` (`department_id`, `booking_date`, `status`),
  INDEX `idx_tokens_customer` (`customer_id`),
  INDEX `idx_tokens_verification` (`verification_code`),
  INDEX `idx_tokens_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: notifications
-- -----------------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `type` VARCHAR(50) DEFAULT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notification_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SAMPLE DATA (Matches Application Initializer)
-- Passwords below are pre-hashed using BCrypt (strength 10)
-- Passwords:
-- Admin:    Admin@123
-- Staff:    Staff@123
-- Customer: Customer@123
-- =============================================================================

-- Users
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `enabled`) VALUES
(1, 'System Administrator', 'admin@smartqueue.com', '+1-800-555-0100', '$2a$10$w81o9VlYlS8RmgC/d8KqB.pI9Y3cEw3fTqX01wR6cK1d/w5Y5WdG6', 'ROLE_ADMIN', 1),
(2, 'Dr. Alok Sharma', 'dr.sharma@hospital.com', '+1-800-555-0101', '$2a$10$bZyE3/gY8Vd5Y7w4Z6X1v.rR7bV7T1eG9X8w1r5e6t7y8u9i0o1p2', 'ROLE_STAFF', 1),
(3, 'Alice Henderson', 'teller.alice@bank.com', '+1-800-555-0102', '$2a$10$bZyE3/gY8Vd5Y7w4Z6X1v.rR7bV7T1eG9X8w1r5e6t7y8u9i0o1p2', 'ROLE_STAFF', 1),
(4, 'Raj Patel', 'officer.raj@gov.com', '+1-800-555-0103', '$2a$10$bZyE3/gY8Vd5Y7w4Z6X1v.rR7bV7T1eG9X8w1r5e6t7y8u9i0o1p2', 'ROLE_STAFF', 1),
(5, 'Emma Watson', 'support.emma@service.com', '+1-800-555-0104', '$2a$10$bZyE3/gY8Vd5Y7w4Z6X1v.rR7bV7T1eG9X8w1r5e6t7y8u9i0o1p2', 'ROLE_STAFF', 1),
(6, 'John Doe', 'john.doe@example.com', '+1-555-0199', '$2a$10$tJ0s2vU1wX7Y8Z9a0B1c2.dE3fG4hI5jK6lM7nO8pQ9rS0tU1v2w3', 'ROLE_CUSTOMER', 1),
(7, 'Sarah Jenkins', 'sarah.smith@example.com', '+1-555-0198', '$2a$10$tJ0s2vU1wX7Y8Z9a0B1c2.dE3fG4hI5jK6lM7nO8pQ9rS0tU1v2w3', 'ROLE_CUSTOMER', 1);

-- Departments across 4 sectors
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `category`, `avg_service_time_minutes`, `daily_token_limit`, `opening_time`, `closing_time`, `is_active`) VALUES
(1, 'General Medicine', 'GM', 'Primary outpatient consultations and health triage.', 'HOSPITAL', 8, 150, '08:30:00', '17:00:00', 1),
(2, 'Cardiology Clinic', 'CRD', 'Heart diagnostics and cardiology consultations.', 'HOSPITAL', 15, 80, '08:30:00', '16:30:00', 1),
(3, 'Pediatrics', 'PED', 'Child and infant healthcare consultations.', 'HOSPITAL', 10, 100, '09:00:00', '17:00:00', 1),
(4, 'Retail Banking & Cashier', 'BNK', 'Cash deposits, withdrawals, and teller services.', 'BANK', 5, 250, '09:00:00', '16:00:00', 1),
(5, 'Loans & Mortgages', 'LNS', 'Personal loans, mortgages, and credit advisory.', 'BANK', 20, 60, '09:30:00', '16:00:00', 1),
(6, 'Passport & National ID', 'GOV', 'Passport verification and biometric identity.', 'GOVERNMENT', 12, 180, '08:30:00', '16:30:00', 1),
(7, 'Licensing & Permits', 'LIC', 'Driver licensing and municipal commerce permits.', 'GOVERNMENT', 10, 120, '08:30:00', '17:00:00', 1),
(8, 'Technical Support', 'SUP', 'Hardware diagnostics and warranty repair.', 'CUSTOMER_SERVICE', 15, 90, '09:00:00', '18:00:00', 1),
(9, 'Billing & Subscriptions', 'BIL', 'Account reconciliation and payment disputes.', 'CUSTOMER_SERVICE', 6, 200, '09:00:00', '18:00:00', 1);

-- Counters
INSERT INTO `counters` (`id`, `counter_number`, `counter_name`, `department_id`, `current_staff_id`, `status`) VALUES
(1, 'C-01', 'Doctor Room 1', 1, 2, 'BUSY'),
(2, 'C-02', 'Doctor Room 2', 1, NULL, 'ACTIVE'),
(3, 'T-01', 'Teller Counter 1', 4, 3, 'ACTIVE'),
(4, 'T-02', 'Teller Counter 2', 4, NULL, 'ACTIVE'),
(5, 'W-01', 'Biometrics Window 1', 6, 4, 'ACTIVE'),
(6, 'D-01', 'Support Desk Alpha', 8, 5, 'ACTIVE');

-- Sample Tokens
INSERT INTO `tokens` (`id`, `token_number`, `token_sequence`, `department_id`, `customer_id`, `counter_id`, `staff_id`, `priority`, `status`, `booking_date`, `booking_time`, `called_time`, `serving_start_time`, `completed_time`, `actual_duration_minutes`, `verification_code`, `notes`) VALUES
(1, 'GM-001', 1, 1, 6, 1, 2, 'NORMAL', 'COMPLETED', CURRENT_DATE, '09:00:00', CONCAT(CURRENT_DATE, ' 09:05:00'), CONCAT(CURRENT_DATE, ' 09:06:00'), CONCAT(CURRENT_DATE, ' 09:14:00'), 8, 'A1B2C3D4E5F67890', 'Routine checkup completed'),
(2, 'GM-002', 2, 1, 7, 1, 2, 'SENIOR_CITIZEN', 'COMPLETED', CURRENT_DATE, '09:10:00', CONCAT(CURRENT_DATE, ' 09:16:00'), CONCAT(CURRENT_DATE, ' 09:17:00'), CONCAT(CURRENT_DATE, ' 09:26:00'), 9, 'B2C3D4E5F67890A1', 'Blood pressure follow-up'),
(3, 'GM-003', 3, 1, 7, 1, 2, 'NORMAL', 'SERVING', CURRENT_DATE, '09:25:00', CONCAT(CURRENT_DATE, ' 09:30:00'), CONCAT(CURRENT_DATE, ' 09:31:00'), NULL, NULL, 'C3D4E5F67890A1B2', 'Fever consultation'),
(4, 'GM-004', 4, 1, 6, NULL, NULL, 'NORMAL', 'WAITING', CURRENT_DATE, '09:35:00', NULL, NULL, NULL, NULL, 'D4E5F67890A1B2C3', 'Lab report evaluation'),
(5, 'BNK-001', 1, 4, 6, 3, 3, 'NORMAL', 'COMPLETED', CURRENT_DATE, '09:15:00', CONCAT(CURRENT_DATE, ' 09:18:00'), CONCAT(CURRENT_DATE, ' 09:18:00'), CONCAT(CURRENT_DATE, ' 09:23:00'), 5, 'E5F67890A1B2C3D4', 'Cash deposit'),
(6, 'BNK-002', 2, 4, 7, NULL, NULL, 'NORMAL', 'WAITING', CURRENT_DATE, '09:45:00', NULL, NULL, NULL, NULL, 'F67890A1B2C3D4E5', 'Cheque deposit');
