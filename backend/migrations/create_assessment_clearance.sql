-- Assessment Clearance Table
-- This table stores assessment clearance forms for part-time faculty

CREATE TABLE IF NOT EXISTS assessment_clearance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(255) NULL,
  first_semester TINYINT(1) DEFAULT 0 COMMENT '1st semester checkbox',
  second_semester TINYINT(1) DEFAULT 0 COMMENT '2nd semester checkbox',
  school_year_from VARCHAR(50) NULL,
  school_year_to VARCHAR(50) NULL,
  name VARCHAR(255) NULL,
  position VARCHAR(255) NULL,
  department VARCHAR(255) NULL,
  college_dean VARCHAR(255) NULL COMMENT 'College Dean signature/name',
  director_of_instruction VARCHAR(255) NULL COMMENT 'Director of Instruction signature/name',
  ecc_administrator VARCHAR(255) NULL COMMENT 'ECC Administrator signature/name',
  date_signed VARCHAR(255) NULL COMMENT 'Date signed for signatures section',
  email_address VARCHAR(255) NULL,
  telephone_cellphone VARCHAR(100) NULL,
  date_fully_accomplished VARCHAR(255) NULL,
  vacation_address TEXT NULL,
  deadline_of_submission VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_date (date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
