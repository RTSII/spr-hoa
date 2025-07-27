-- Insert yourself as admin in the admin_users table
INSERT INTO admin_users (user_id, email, role)
VALUES ('9c7335bf-9b9f-4d03-b013-1ac48591b93d', 'rtsii10@gmail.com', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', email = 'rtsii10@gmail.com';

-- You are now the sole admin for the SPR HOA portal!
