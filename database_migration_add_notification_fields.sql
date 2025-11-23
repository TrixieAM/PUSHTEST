-- Migration: Add notification_type, action_link, and announcement_id columns to notifications table
-- Run this SQL to update your database schema

ALTER TABLE `notifications` 
ADD COLUMN `notification_type` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Type of notification: payslip, leave, announcement, etc.' AFTER `description`,
ADD COLUMN `action_link` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Route to navigate when notification is clicked' AFTER `notification_type`,
ADD COLUMN `announcement_id` INT(11) NULL DEFAULT NULL COMMENT 'ID of the announcement if notification_type is announcement' AFTER `action_link`;

-- Update existing notifications to have a default type
UPDATE `notifications` SET `notification_type` = 'leave' WHERE `notification_type` IS NULL;

