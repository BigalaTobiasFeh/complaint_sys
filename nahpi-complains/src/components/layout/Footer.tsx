import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">NC</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">NAHPI Complaints</h3>
                <p className="text-blue-100 text-sm">Complaint Management System</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Streamlining complaint resolution for educational excellence. 
              A comprehensive system designed to facilitate efficient communication 
              between students, administrators, and department officers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-blue-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-blue-100 hover:text-white transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-blue-100 hover:text-white transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-blue-100 hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/department/login" className="text-blue-100 hover:text-white transition-colors">
                  Department Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  System Status
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-600 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm">
            © 2024 NAHPI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-blue-200 hover:text-white transition-colors">
              <span className="sr-only">Terms of Service</span>
              <span className="text-sm">Terms</span>
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">
              <span className="sr-only">Privacy Policy</span>
              <span className="text-sm">Privacy</span>
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">
              <span className="sr-only">Contact</span>
              <span className="text-sm">Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
