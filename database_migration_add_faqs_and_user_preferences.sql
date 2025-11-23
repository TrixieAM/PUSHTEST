-- Migration: Create FAQs, user preferences, and About Us tables
-- Run this SQL to create the necessary tables for Settings page

-- FAQs Table
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL COMMENT 'The FAQ question',
  `answer` TEXT NOT NULL COMMENT 'The FAQ answer',
  `category` VARCHAR(50) NULL DEFAULT 'general' COMMENT 'Category: general, password, email, mfa, etc.',
  `display_order` INT(11) NOT NULL DEFAULT 0 COMMENT 'Order for display',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether the FAQ is active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_display_order` (`display_order`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores frequently asked questions';

-- User Preferences Table (for MFA/OTP settings)
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_number` VARCHAR(64) NOT NULL COMMENT 'Employee number',
  `enable_mfa` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Enable Multi-Factor Authentication (OTP) on login',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_preferences` (`employee_number`),
  INDEX `idx_employee_number` (`employee_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores user preferences like MFA settings';

-- About Us Content Table
CREATE TABLE IF NOT EXISTS `about_us` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL DEFAULT 'About Us' COMMENT 'Title of the About Us section',
  `content` LONGTEXT NOT NULL COMMENT 'About Us content (HTML supported)',
  `version` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Version number',
  `last_updated_by` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Employee number of last updater',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores About Us content';

-- Insert default About Us content
INSERT INTO `about_us` (`title`, `content`) 
VALUES (
  'About Us',
  '<h2>Welcome to EARIST Human Resources Information System</h2>
  <p>The Human Resources Information System (HRIS) is designed to streamline and manage all human resource operations for Eulogio "Amang" Rodriguez Institute of Science and Technology (EARIST).</p>
  <h3>Our Mission</h3>
  <p>To provide an efficient, secure, and user-friendly platform for managing employee information, payroll, attendance, and other HR-related processes.</p>
  <h3>Features</h3>
  <ul>
    <li>Employee Profile Management</li>
    <li>Payroll Processing</li>
    <li>Attendance Tracking</li>
    <li>Leave Management</li>
    <li>Reports and Analytics</li>
  </ul>
  <p>For any questions or support, please contact the HR department.</p>'
) ON DUPLICATE KEY UPDATE `title` = `title`;

-- Insert some default FAQs
INSERT INTO `faqs` (`question`, `answer`, `category`, `display_order`) VALUES
('How do I change my password?', 'Go to Settings > Change Password. Enter your current password, verify the code sent to your email, and create a new password.', 'password', 1),
('How do I update my email address?', 'Go to Settings > Email Settings. Enter your new email address twice to confirm, then click Update Email.', 'email', 2),
('What is MFA/OTP and how does it work?', 'MFA (Multi-Factor Authentication) adds an extra layer of security. When enabled, you will receive a 6-digit code via email every time you log in. Enter this code to complete your login.', 'mfa', 3),
('How can I enable or disable MFA?', 'Go to Settings > Security Settings. Toggle the "Enable MFA/OTP on Login" switch to turn it on or off.', 'mfa', 4),
('I forgot my password. What should I do?', 'Contact your system administrator or HR department to reset your password. They can help you regain access to your account.', 'password', 5),
('How long is the verification code valid?', 'Verification codes expire after 15 minutes. If your code expires, you can request a new one.', 'general', 6)
ON DUPLICATE KEY UPDATE `question` = `question`;

