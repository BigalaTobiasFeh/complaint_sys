# 🚀 NAHPI Complaints - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Application Status**
- [x] All admin panel features implemented and tested
- [x] Database integration with Supabase working
- [x] Authentication system functional
- [x] Error handling implemented
- [x] Production-ready configuration files created

### ✅ **Required Accounts & Services**
- [x] GitHub account (connected to Vercel)
- [x] Vercel account
- [x] Supabase project (nahpi) with database setup

---

## 🔧 **Step-by-Step Deployment Process**

### **Step 1: Push Code to GitHub**

1. **Initialize Git Repository** (if not already done):
   ```bash
   cd /home/hust/Desktop/complaint_sys/nahpi-complains
   git init
   git add .
   git commit -m "Initial commit: NAHPI Complaints System"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New Repository"
   - Name: `nahpi-complaints-system`
   - Description: `NAHPI University Complaint Management System`
   - Set to Public or Private (your choice)
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nahpi-complaints-system.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy to Vercel**

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select `nahpi-complaints-system`

2. **Configure Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### **Step 3: Set Environment Variables**

In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qbxgswcslywltbuoqnbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: Replace `your_service_role_key_here` with your actual Supabase service role key.

### **Step 4: Deploy**

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (usually 2-3 minutes)
3. Your app will be available at: `https://your-project-name.vercel.app`

---

## 🔐 **Security Configuration**

### **Supabase RLS Policies**
Ensure these Row Level Security policies are enabled:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Students can only see their own complaints
CREATE POLICY "Students can view own complaints" ON complaints
FOR SELECT USING (student_id = auth.uid());

-- Department officers can see complaints in their department
CREATE POLICY "Officers can view department complaints" ON complaints
FOR SELECT USING (
  department_id IN (
    SELECT department_id FROM department_officers 
    WHERE user_id = auth.uid()
  )
);

-- Admins can see all data
CREATE POLICY "Admins can view all" ON complaints
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### **Environment Variables Security**
- ✅ All sensitive keys stored in Vercel environment variables
- ✅ No secrets committed to GitHub
- ✅ Supabase RLS policies protect data access

---

## 🌐 **Domain Configuration (Optional)**

### **Custom Domain Setup**:
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `complaints.nahpi.edu`)
3. Configure DNS records as instructed by Vercel
4. SSL certificate will be automatically provisioned

---

## 📊 **Post-Deployment Testing**

### **Test These Features**:
1. **Authentication**:
   - Student login/registration
   - Department officer login
   - Admin login

2. **Core Functionality**:
   - Submit complaint (student)
   - View complaints (all roles)
   - Manage complaints (officers/admin)
   - User management (admin)

3. **Admin Panel**:
   - Dashboard statistics
   - User management
   - Department management
   - Complaint analytics

### **Performance Testing**:
- Check Lighthouse scores
- Test mobile responsiveness
- Verify loading speeds

---

## 🔧 **Troubleshooting**

### **Common Issues**:

1. **Build Failures**:
   - Check TypeScript errors: `npm run type-check`
   - Fix ESLint issues: `npm run lint:fix`

2. **Environment Variables**:
   - Ensure all required variables are set in Vercel
   - Check variable names match exactly

3. **Database Connection**:
   - Verify Supabase URL and keys
   - Check RLS policies are correctly configured

4. **Authentication Issues**:
   - Update Supabase Auth settings with new domain
   - Add Vercel domain to allowed origins

---

## 📈 **Monitoring & Analytics**

### **Vercel Analytics**:
- Enable Vercel Analytics in project settings
- Monitor performance and user behavior

### **Error Tracking**:
- Consider integrating Sentry for error tracking
- Monitor Vercel function logs

---

## 🚀 **Your Deployment URLs**

After deployment, you'll have:
- **Production URL**: `https://your-project-name.vercel.app`
- **Admin Panel**: `https://your-project-name.vercel.app/admin`
- **Student Portal**: `https://your-project-name.vercel.app/student`
- **Department Portal**: `https://your-project-name.vercel.app/department`

---

## 📞 **Support**

If you encounter any issues during deployment:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review Supabase logs

**Your NAHPI Complaints System is ready for production! 🎉**
