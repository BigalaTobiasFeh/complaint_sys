import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Using system fonts to avoid Google Fonts loading issues during build

export const metadata: Metadata = {
  title: "NAHPI Complains - Complaint Management System",
  description: "A comprehensive complaint management system for educational institutions. Submit, track, and resolve complaints efficiently.",
  keywords: ["complaint management", "education", "student services", "NAHPI"],
  authors: [{ name: "NAHPI Development Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background font-sans">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
