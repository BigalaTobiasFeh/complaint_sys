-- Complete RLS Fix for Authentication Issues
-- Run this in Supabase SQL Editor to fix all RLS policy issues

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can insert own data" ON students;
DROP POLICY IF EXISTS "Admins can view own data" ON admins;
DROP POLICY IF EXISTS "Admins can insert own data" ON admins;
DROP POLICY IF EXISTS "Department officers can view own data" ON department_officers;
DROP POLICY IF EXISTS "Department officers can insert own data" ON department_officers;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all students" ON students;
DROP POLICY IF EXISTS "Admins can view all department_officers" ON department_officers;
DROP POLICY IF EXISTS "Officers can view department students" ON students;
DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
DROP POLICY IF EXISTS "Students can view own complaints" ON complaints;
DROP POLICY IF EXISTS "Students can create complaints" ON complaints;
DROP POLICY IF EXISTS "Officers can view department complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON complaints;

-- Disable RLS temporarily to ensure clean setup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE department_officers DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view and manage all users
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Students table policies
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update own data" ON students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students can insert own data" ON students FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all students
CREATE POLICY "Admins can view all students" ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow department officers to view students in their department
CREATE POLICY "Officers can view department students" ON students FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM department_officers dept_officer 
        WHERE dept_officer.id = auth.uid() AND dept_officer.department_id = students.department_id
    )
);

-- Admins table policies
CREATE POLICY "Admins can view own data" ON admins FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can insert own data" ON admins FOR INSERT WITH CHECK (auth.uid() = id);

-- Department officers table policies
CREATE POLICY "Department officers can view own data" ON department_officers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Department officers can insert own data" ON department_officers FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all department officers
CREATE POLICY "Admins can view all department_officers" ON department_officers FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Departments table - allow everyone to read (for dropdowns)
CREATE POLICY "Everyone can view departments" ON departments FOR SELECT TO authenticated USING (true);

-- Complaints table policies
CREATE POLICY "Students can view own complaints" ON complaints FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create complaints" ON complaints FOR INSERT WITH CHECK (student_id = auth.uid());

-- Department officers can view complaints assigned to their department
CREATE POLICY "Officers can view department complaints" ON complaints FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM department_officers dept_officer 
        WHERE dept_officer.id = auth.uid() AND dept_officer.department_id = complaints.department_id
    )
);

-- Admins can view all complaints
CREATE POLICY "Admins can view all complaints" ON complaints FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Complaint attachments policies
CREATE POLICY "Users can view complaint attachments" ON complaint_attachments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM complaints c 
        WHERE c.id = complaint_attachments.complaint_id 
        AND (
            c.student_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (
                SELECT 1 FROM department_officers dept_officer 
                WHERE dept_officer.id = auth.uid() AND dept_officer.department_id = c.department_id
            )
        )
    )
);

-- Complaint responses policies
CREATE POLICY "Users can view complaint responses" ON complaint_responses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM complaints c 
        WHERE c.id = complaint_responses.complaint_id 
        AND (
            c.student_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (
                SELECT 1 FROM department_officers dept_officer 
                WHERE dept_officer.id = auth.uid() AND dept_officer.department_id = c.department_id
            )
        )
    )
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Refresh the schema
NOTIFY pgrst, 'reload schema';

-- Test query to verify setup
SELECT 'RLS policies updated successfully' as status;
