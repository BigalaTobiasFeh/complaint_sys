-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'admin', 'department_officer');
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'rejected');
CREATE TYPE complaint_category AS ENUM ('ca_mark', 'exam_mark', 'other');
CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_type AS ENUM ('complaint_submitted', 'complaint_assigned', 'complaint_updated', 'complaint_resolved', 'deadline_reminder');

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    head_of_department VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    matricule VARCHAR(50) NOT NULL UNIQUE CHECK (matricule ~ '^UBa\d{2}[A-Z]\d{4}$'),
    department_id UUID REFERENCES departments(id),
    year_of_study INTEGER NOT NULL CHECK (year_of_study >= 1 AND year_of_study <= 5),
    phone_number VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    verification_method VARCHAR(10) DEFAULT 'email' CHECK (verification_method IN ('email', 'phone')),
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(10),
    verification_expires_at TIMESTAMP WITH TIME ZONE
);

-- Admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Department Officers table
CREATE TABLE department_officers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(255) NOT NULL
);

-- Complaints table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id VARCHAR(20) NOT NULL UNIQUE,
    student_id UUID REFERENCES students(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category complaint_category NOT NULL,
    status complaint_status DEFAULT 'pending',
    priority complaint_priority DEFAULT 'medium',
    
    -- Academic Information
    course_code VARCHAR(20) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    course_level VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    
    -- Assignment and Processing
    assigned_to UUID REFERENCES department_officers(id),
    department_id UUID REFERENCES departments(id),
    
    -- Timeline
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Complaint Attachments table
CREATE TABLE complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint Responses table
CREATE TABLE complaint_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint Feedback table
CREATE TABLE complaint_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_complaint_id UUID REFERENCES complaints(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_matricule ON students(matricule);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_complaints_student ON complaints(student_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial departments
INSERT INTO departments (name, code, description) VALUES
('Centre for Cybersecurity and Mathematical Cryptology', 'CMC', 'Department focusing on cybersecurity and cryptology'),
('Chemical and Biological Engineering', 'CBE', 'Department of chemical and biological engineering'),
('Civil Engineering and Architecture', 'CVL', 'Department of civil engineering and architecture'),
('Computer Engineering', 'COM', 'Department of computer engineering'),
('Electrical and Electronics Engineering', 'EEEE', 'Department of electrical and electronics engineering'),
('Mechanical and Industrial Engineering', 'MEC', 'Department of mechanical and industrial engineering'),
('Mining and Mineral Engineering', 'MIN', 'Department of mining and mineral engineering'),
('Petroleum Engineering', 'PET', 'Department of petroleum engineering');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Students can read their own data
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update own data" ON students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students can insert own data" ON students FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can read all data
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Students can view their own complaints
CREATE POLICY "Students can view own complaints" ON complaints FOR SELECT USING (
    student_id = auth.uid()
);

-- Students can create complaints
CREATE POLICY "Students can create complaints" ON complaints FOR INSERT WITH CHECK (
    student_id = auth.uid()
);

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
