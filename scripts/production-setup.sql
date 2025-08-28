-- Create production database
CREATE DATABASE college_erp_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated database user
CREATE USER 'college_erp_user'@'%' IDENTIFIED BY 'secure_production_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON college_erp_prod.* TO 'college_erp_user'@'%';
FLUSH PRIVILEGES;

-- Enable performance schema
SET GLOBAL performance_schema = ON;

-- Configure MySQL for production
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
