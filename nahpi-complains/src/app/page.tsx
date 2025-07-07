import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
// import ubaImage from './uba.png';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
  //  backgroundImage: `linear-gradient(rgba(8, 56, 127, 0.8), rgba(8, 56, 127, 0.1)), url(${ubaImage})`,        
  backgroundImage: `linear-gradient(rgba(8, 56, 127, 0.8), rgba(8, 56, 127, 0.6)), url('https://ubastudent.online/images/bam.png')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}}

      />

      {/* Content */}
      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                NAHPi Complaints
              </h1>
              <div className="max-w-4xl mx-auto mb-10">
                <p className="text-xl md:text-2xl lg:text-3xl text-white/90 leading-relaxed font-light">
                  A comprehensive complaint management system designed to streamline the resolution process
                  for students, administrators, and department officers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100 border-0">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white border-white hover:bg-white hover:text-primary">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <CardTitle>Easy Submission</CardTitle>
                  <CardDescription>
                    Submit complaints quickly with our intuitive form system. Upload supporting documents and track your submissions.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardTitle>Real-time Tracking</CardTitle>
                  <CardDescription>
                    Monitor the progress of your complaints with real-time status updates and notifications.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <CardTitle>Multi-Role Support</CardTitle>
                  <CardDescription>
                    Designed for students, administrators, and department officers with role-specific dashboards and features.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* User Types Section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-center text-primary mb-8">Who Can Use NAHPi Complaints?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Students</h3>
                  <p className="text-gray-600">Submit complaints about CA marks, exam marks, and other academic issues. Track progress and provide feedback.</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Administrators</h3>
                  <p className="text-gray-600">Manage user accounts, monitor resolution processes, and generate comprehensive reports.</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Department Officers</h3>
                  <p className="text-gray-600">View and respond to department-specific complaints, update status, and communicate with students.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-primary/95 backdrop-blur-sm text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-lg font-semibold mb-2">NAHPi Complaints</p>
            <p className="text-blue-100">Streamlining complaint resolution for educational excellence</p>
            <p className="text-blue-200 text-sm mt-4">© 2024 NAHPi. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
