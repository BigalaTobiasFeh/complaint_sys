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

## 📦 **Installation & Setup**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nahpi-complaints-system.git
   cd nahpi-complaints-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 **Deployment**

### Quick Deployment to Vercel

1. **Run the deployment preparation script**:
   ```bash
   ./deploy.sh
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables
   - Deploy!

For detailed deployment instructions, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md).

## 🔐 **Security Features**

- **Row Level Security (RLS)**: Database-level access control
- **Role-based Authentication**: Student, Officer, Admin roles
- **Secure File Upload**: Validated file types and sizes
- **CSRF Protection**: Built-in Next.js security
- **Environment Variable Protection**: Sensitive data secured

## 📊 **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase      │    │   Vercel        │
│                 │    │                 │    │                 │
│ • Student Portal│◄──►│ • PostgreSQL    │    │ • Hosting       │
│ • Officer Portal│    │ • Authentication│    │ • CI/CD         │
│ • Admin Panel   │    │ • File Storage  │    │ • Edge Network  │
│ • API Routes    │    │ • Real-time     │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License.

## 👥 **Team**

- **NAHPI Development Team** - Initial work and maintenance

## 📞 **Support**

For support and questions:
- 📧 Email: support@nahpi.edu
- 🐛 Issues: Create GitHub Issues for bug reports

---

**Built with ❤️ for NAHPI University**
