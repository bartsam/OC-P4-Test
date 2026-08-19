INSERT INTO users(first_name, last_name, admin, email, password) VALUES 
('Test', 'Admin', true, 'yoga@studio.com', '$2a$10$.Hsa/ZjUVaHqi0tp9xieMeewrnZxrZ5pQRzddUXE/WjDu2ZThe6Iq')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO users(first_name, last_name, admin, email, password) VALUES 
('Test', 'User', false, 'user@studio.com', '$2a$10$.Hsa/ZjUVaHqi0tp9xieMeewrnZxrZ5pQRzddUXE/WjDu2ZThe6Iq')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO teachers (first_name, last_name)
SELECT 'Test', 'Teacher'
WHERE NOT EXISTS (
    SELECT 1 FROM teachers WHERE first_name = 'Test' AND last_name = 'Teacher'
);