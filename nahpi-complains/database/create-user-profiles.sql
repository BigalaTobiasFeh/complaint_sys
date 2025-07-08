-- Create User Profiles for Your Existing Auth Users
-- Run this AFTER running fix-infinite-recursion.sql

-- Create Admin Profile
INSERT INTO users (id, email, name, role, is_active) 
VALUES ('73602cb4-c07c-4994-b615-cf3e9a134d4b', 'admin01@nahpi.edu', 'System Administrator', 'admin', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO admins (id, permissions) 
VALUES ('73602cb4-c07c-4994-b615-cf3e9a134d4b', ARRAY['manage_users', 'manage_complaints', 'generate_reports'])
ON CONFLICT (id) DO UPDATE SET
  permissions = EXCLUDED.permissions;

-- Create Department Officer Profile
INSERT INTO users (id, email, name, role, is_active) 
VALUES ('5ffc9e46-f3b4-409e-b536-3edfcf17e875', 'officer.com@nahpi.edu', 'Computer Engineering Officer', 'department_officer', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO department_officers (id, department_id, position) 
VALUES ('5ffc9e46-f3b4-409e-b536-3edfcf17e875', (SELECT id FROM departments WHERE code = 'COM'), 'Department Officer')
ON CONFLICT (id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  position = EXCLUDED.position;

-- Verify the setup
SELECT 'User Profiles Created Successfully' as status;

SELECT 'Admin Profile:' as type, u.email, u.name, u.role, a.permissions
FROM users u
JOIN admins a ON u.id = a.id
WHERE u.email = 'admin01@nahpi.edu';

SELECT 'Department Officer Profile:' as type, u.email, u.name, u.role, d.name as department
FROM users u
JOIN department_officers do ON u.id = do.id
JOIN departments d ON do.department_id = d.id
WHERE u.email = 'officer.com@nahpi.edu';

SELECT 'All Users:' as type, email, name, role FROM users ORDER BY role;
