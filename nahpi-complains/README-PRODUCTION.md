# 🎓 NAHPI Complaints System

A comprehensive complaint management system for NAHPI University, built with Next.js and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/nahpi-complaints-system)

## 🌟 Features

### 👨‍🎓 **Student Portal**
- Submit complaints across multiple categories (CA marks, exam marks, final grades, etc.)
- Track complaint status and progress in real-time
- View comprehensive complaint history
- Receive notifications on updates
- Secure file attachments support

### 👮‍♂️ **Department Officer Portal**
- Manage assigned complaints efficiently
- Update complaint status with detailed responses
- Add resolutions and follow-up actions
- View department analytics and performance metrics
- Workload management and assignment tracking

### 🔧 **Admin Panel**
- Comprehensive dashboard with real-time statistics
- Complete user management (students, officers, admins)
- Department management and organizational structure
- Advanced complaint analytics and reporting
- System configuration and deadline management

## 🚀 **Live Demo**

- **Production**: `https://your-app-name.vercel.app`
- **Admin Panel**: `https://your-app-name.vercel.app/admin`
- **Student Portal**: `https://your-app-name.vercel.app/student`
- **Department Portal**: `https://your-app-name.vercel.app/department`

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel with automatic CI/CD
- **Authentication**: Supabase Auth with Row Level Security

## 📦 **Quick Start**

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/nahpi-complaints-system.git
cd nahpi-complaints-system
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Update .env.local with your Supabase credentials
```

### 3. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel
```bash
./deploy.sh  # Runs pre-deployment checks
# Then push to GitHub and deploy via Vercel dashboard
```

## 📚 **Documentation**

- [📖 Deployment Guide](./DEPLOYMENT-GUIDE.md) - Complete deployment instructions
- [⚙️ Admin Setup Guide](./ADMIN-SETUP-GUIDE.md) - Admin panel documentation
- [🔧 Environment Variables](./docs/environment.md) - Configuration guide

## 🔐 **Security Features**

- Row Level Security (RLS) for data protection
- Role-based access control (Student/Officer/Admin)
- Secure file upload with validation
- Environment variable protection
- CSRF and XSS protection

## 📊 **System Status**

✅ **Production Ready**
- All core features implemented
- Error handling and fallbacks
- Performance optimized
- Security hardened
- Mobile responsive

## 🤝 **Support**

- 📧 Email: support@nahpi.edu
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/nahpi-complaints-system/issues)
- 📖 Wiki: [Documentation](https://github.com/YOUR_USERNAME/nahpi-complaints-system/wiki)

---

**Built with ❤️ for NAHPI University**
