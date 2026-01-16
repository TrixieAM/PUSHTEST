-- ============================================
-- Admin Security Database Changes
-- ============================================
-- This script adds support for global MFA control
-- Run this script on your database to enable the feature

-- Add global_mfa_enabled setting to system_settings table
-- This setting controls MFA for all users system-wide
INSERT INTO system_settings (setting_key, setting_value) 
VALUES ('global_mfa_enabled', 'true')
ON DUPLICATE KEY UPDATE setting_value = 'true';

-- Note: If the system_settings table doesn't exist, it should be created first
-- The table structure should be:
-- CREATE TABLE IF NOT EXISTS system_settings (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   setting_key VARCHAR(255) UNIQUE NOT NULL,
--   setting_value TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Default value: 'true' means global MFA is enabled by default
-- Set to 'false' to disable global MFA and allow individual user preferences
