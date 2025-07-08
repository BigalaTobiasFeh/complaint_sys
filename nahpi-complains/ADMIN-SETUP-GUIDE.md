# Admin & Department Officer Setup Guide

## 🎯 Updated Matricule Format

**New Format**: `UBa<last_two_digits_of_year><any_capital_letter><four_digits>`

**Examples**:
- `UBa25T1000` (Year 2025, Letter T, Number 1000)
- `UBa24A0001` (Year 2024, Letter A, Number 0001)
- `UBa25Z9999` (Year 2025, Letter Z, Number 9999)

**Validation**: The system now validates this format in both registration and login forms.

---

## 🔧 Creating Admin and Department Officer Users

After running the database schema, you have **3 methods** to create admin and department officer users:

### Method 1: Using Supabase Dashboard (Recommended)

#### Step 1: Create Admin User
1. Go to your Supabase project: https://qbxgswcslywltbuoqnbv.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"**
4. Fill in:
   - **Email**: `admin@nahpi.edu` (or your preferred admin email)
   - **Password**: `your-secure-password`
   - **Email Confirm**: ✅ Check this box
5. Click **"Create user"**

#### Step 2: Add Admin Profile
1. Go to **Database** → **Table Editor**
2. Select **`users`** table
3. Click **"Insert"** → **"Insert row"**
4. Fill in:
   - **id**: Copy the user ID from Authentication → Users
   - **email**: Same email as above
   - **name**: `System Administrator`
   - **role**: `admin`
   - **is_active**: `true`
5. Click **"Save"**

#### Step 3: Add Admin Permissions
1. Select **`admins`** table
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **id**: Same user ID as above
   - **permissions**: `["manage_users", "manage_complaints", "generate_reports"]`
4. Click **"Save"**

#### Step 4: Create Department Officers
Repeat the process for each department:

**For Computer Engineering Officer:**
1. **Authentication**: Create user with email `officer.com@nahpi.edu`
2. **users table**: 
   - **role**: `department_officer`
   - **name**: `Computer Engineering Officer`
3. **department_officers table**:
   - **department_id**: Get ID from departments table where code = 'COM'
   - **position**: `Department Officer`

**Repeat for all 8 departments:**
- `officer.cmc@nahpi.edu` (CMC)
- `officer.cbe@nahpi.edu` (CBE)
- `officer.cvl@nahpi.edu` (CVL)
- `officer.com@nahpi.edu` (COM)
- `officer.eeee@nahpi.edu` (EEEE)
- `officer.mec@nahpi.edu` (MEC)
- `officer.min@nahpi.edu` (MIN)
- `officer.pet@nahpi.edu` (PET)

---

### Method 2: Using SQL Commands

Execute these SQL commands in Supabase SQL Editor:

```sql
-- 1. Create Admin User (Replace with actual user ID from auth.users)
-- First create the user in Authentication UI, then run:

INSERT INTO users (id, email, name, role, is_active) 
VALUES (
  'USER_ID_FROM_AUTH_USERS', 
  'admin@nahpi.edu', 
  'System Administrator', 
  'admin', 
  true
);

INSERT INTO admins (id, permissions) 
VALUES (
  'USER_ID_FROM_AUTH_USERS', 
  ARRAY['manage_users', 'manage_complaints', 'generate_reports']
);

-- 2. Create Department Officers (Replace USER_IDs)
-- Computer Engineering Officer
INSERT INTO users (id, email, name, role, is_active) 
VALUES (
  'COM_OFFICER_USER_ID', 
  'officer.com@nahpi.edu', 
  'Computer Engineering Officer', 
  'department_officer', 
  true
);

INSERT INTO department_officers (id, department_id, position) 
VALUES (
  'COM_OFFICER_USER_ID', 
  (SELECT id FROM departments WHERE code = 'COM'), 
  'Department Officer'
);

-- Repeat for other departments...
```

---

### Method 3: Using the Seeding Script (Development Only)

**⚠️ Note**: This method requires the service role key and should only be used in development.

1. Update the seeding script with your preferred credentials
2. Run: `npx ts-node scripts/seed-users.ts`

---

## 🧪 Testing Your Setup

### Test Admin Login
1. Go to: http://localhost:3001/admin/login
2. Email: `admin@nahpi.edu`
3. Password: `your-password`
4. Should redirect to: `/admin/dashboard`

### Test Department Officer Login
1. Go to: http://localhost:3001/department/login
2. Email: `officer.com@nahpi.edu`
3. Password: `your-password`
4. Should redirect to: `/department/dashboard`

### Test Student Registration
1. Go to: http://localhost:3001/register
2. Use matricule format: `UBa25T1000`
3. Select department from dropdown
4. Complete registration
5. Login at: http://localhost:3001/login

---

## 🔍 Verification Checklist

After creating users, verify in Supabase:

### Check Authentication
- [ ] Users appear in **Authentication** → **Users**
- [ ] Email confirmed status is ✅
- [ ] Users can sign in

### Check Database Tables
- [ ] **users** table has entries with correct roles
- [ ] **admins** table has admin entries
- [ ] **department_officers** table has officer entries
- [ ] **departments** table has all 8 departments

### Check Application Access
- [ ] Admin can access `/admin/dashboard`
- [ ] Officers can access `/department/dashboard`
- [ ] Students can access `/dashboard`
- [ ] Unauthorized access redirects properly

---

## 🚨 Troubleshooting

### Common Issues:

**"User not found" error:**
- Check if user exists in both `auth.users` and `users` table
- Verify the user ID matches between tables

**"Unauthorized access" error:**
- Check the `role` field in `users` table
- Verify RLS policies are applied correctly

**Department officer can't see department data:**
- Check `department_id` in `department_officers` table
- Verify department exists in `departments` table

**Matricule validation fails:**
- Ensure format is exactly: `UBa25T1000`
- Check for typos in year, letter, or numbers

---

## 🎉 Ready to Go!

Once you've created your admin and department officer users:

1. **Admin** can manage the entire system
2. **Department Officers** can handle department-specific complaints
3. **Students** can register with the new matricule format
4. All authentication flows are secure and role-based

The system is now ready for the next phase: **Complaint Management Implementation**!
