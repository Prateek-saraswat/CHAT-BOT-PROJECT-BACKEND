-- Document Chatbot Database Setup
-- Run this script to create the database and tables

-- Create database
-- CREATE DATABASE IF NOT EXISTS document_chatbot;

-- USE document_chatbot;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    content LONGTEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_filename (filename),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a user with specific privileges (recommended for production)
-- Replace 'your_password' with a strong password
-- CREATE USER 'chatbot_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON document_chatbot.* TO 'chatbot_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Display tables
SHOW TABLES;

-- Display table structures
DESCRIBE documents;
DESCRIBE conversations;

SELECT 'Database setup completed successfully!' as Status;