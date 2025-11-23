-- Migration: Create reports table for storing generated reports
-- Run this SQL to create the reports table

CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_type` VARCHAR(50) NOT NULL COMMENT 'Type of report: attendance, payroll, leave, employee, etc.',
  `report_month` INT(2) NOT NULL COMMENT 'Month (1-12)',
  `report_year` INT(4) NOT NULL COMMENT 'Year (e.g., 2024)',
  `generated_by` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Employee number of user who generated the report',
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the report was generated',
  `data` LONGTEXT NULL DEFAULT NULL COMMENT 'JSON data containing the report statistics',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'Status: active, archived',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report` (`report_type`, `report_month`, `report_year`),
  INDEX `idx_report_type` (`report_type`),
  INDEX `idx_report_period` (`report_month`, `report_year`),
  INDEX `idx_generated_by` (`generated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores generated reports with monthly reset capability';

