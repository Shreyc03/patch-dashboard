create database patch_server;
use patch_server;

CREATE TABLE customers (
customer_id INT AUTO_INCREMENT PRIMARY KEY,
organization_name VARCHAR(255) NOT NULL,
contact_email VARCHAR(255),
location VARCHAR(255),
onboarded_date DATE,
status ENUM('Active', 'Inactive') DEFAULT 'Active',
os_version_used VARCHAR(100) -- optional, could also be JSON for multiple
);

CREATE TABLE agents (
agent_id INT AUTO_INCREMENT PRIMARY KEY,
customer_id INT NOT NULL,
hostname VARCHAR(255) NOT NULL,
ip_address VARCHAR(45),
os_version VARCHAR(100),
agent_version VARCHAR(100),
last_seen DATETIME,
status ENUM('Online', 'Offline') DEFAULT 'Offline',
FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
ON DELETE CASCADE
);

CREATE TABLE patches (
patch_id INT AUTO_INCREMENT PRIMARY KEY,
patch_version VARCHAR(100) NOT NULL,
release_date DATE,
description TEXT,
file_url VARCHAR(512),
platform VARCHAR(50), -- Windows/Linux/Mac
os_version_supported VARCHAR(100), -- e.g. "Windows 10+", or JSON string
status ENUM('Active', 'Deprecated') DEFAULT 'Active'
);

CREATE TABLE patch_deployments (
deployment_id INT AUTO_INCREMENT PRIMARY KEY,
agent_id INT NOT NULL,
patch_id INT NOT NULL,
deployment_status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
deployment_time DATETIME,
error_log TEXT,
FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
ON DELETE CASCADE,
FOREIGN KEY (patch_id) REFERENCES patches(patch_id)
ON DELETE CASCADE
);

CREATE TABLE activity_logs (
log_id INT AUTO_INCREMENT PRIMARY KEY,
agent_id INT NOT NULL,
action_type ENUM('Check-in', 'Patch Download', 'Patch Apply') NOT NULL,
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
details TEXT,
FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
ON DELETE CASCADE
);

INSERT INTO customers (organization_name, contact_email, location, onboarded_date, status, os_version_used) VALUES
('Acme Corp', 'it@acme.com', 'New York', '2023-01-15', 'Active', 'Windows 10'),
('BetaSoft', 'support@beta.com', 'San Jose', '2023-03-01', 'Active', 'Ubuntu 20.04');

INSERT INTO agents (customer_id, hostname, ip_address, os_version, agent_version, last_seen, status) VALUES
(1, 'ACME-PC-01', '10.0.0.5', 'Windows 10', 'v1.0.3', NOW(), 'Online'),
(1, 'ACME-PC-02', '10.0.0.6', 'Windows 10', 'v1.0.3', NOW() - INTERVAL 1 HOUR, 'Offline'),
(2, 'BETA-SERVER-1', '192.168.1.20', 'Ubuntu 20.04', 'v2.1.0', NOW(), 'Online');

INSERT INTO patches (patch_version, release_date, description, file_url, platform, os_version_supported, status) VALUES
('v2025.07.1', '2025-07-10', 'Security patch July 2025', 'https://patches.com/july1', 'Windows', 'Windows 10+', 'Active'),
('v2025.07.2', '2025-07-15', 'Kernel update', 'https://patches.com/july2', 'Linux', 'Ubuntu 18.04+', 'Active');

INSERT INTO patch_deployments (agent_id, patch_id, deployment_status, deployment_time, error_log) VALUES
(1, 1, 'Success', NOW() - INTERVAL 2 DAY, NULL),
(2, 1, 'Failed', NOW() - INTERVAL 1 DAY, 'Timeout while reboot'),
(3, 2, 'Success', NOW() - INTERVAL 12 HOUR, NULL);

INSERT INTO activity_logs (agent_id, action_type, timestamp, details) VALUES
(1, 'Check-in', NOW(), 'Agent heartbeat OK'),
(1, 'Patch Download', NOW() - INTERVAL 2 DAY, 'Downloaded patch v2025.07.1'),
(2, 'Patch Apply', NOW() - INTERVAL 1 DAY, 'Failed during reboot'),
(3, 'Patch Apply', NOW() - INTERVAL 12 HOUR, 'Patch applied successfully');