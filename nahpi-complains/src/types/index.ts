// User Types
export type UserRole = 'student' | 'admin' | 'department_officer'
export type NotificationType = 'complaint_submitted' | 'complaint_updated' | 'complaint_assigned' | 'complaint_resolved' | 'deadline_reminder'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  role: 'student'
  matricule: string
  department: string
  yearOfStudy: number
  phoneNumber: string
  academicYear: string
}

export interface Admin extends User {
  role: 'admin'
  permissions: string[]
}

export interface DepartmentOfficer extends User {
  role: 'department_officer'
  department: string
  position: string
}

// Complaint Types
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected'
export type ComplaintCategory = 'ca_mark' | 'exam_mark' | 'other'

export interface Complaint {
  id: string
  complaintId: string
  studentId: string
  student: Student
  title: string
  description: string
  category: ComplaintCategory
  status: ComplaintStatus
  priority: 'low' | 'medium' | 'high'
  
  // Academic Information
  courseCode: string
  courseTitle: string
  courseLevel: string
  semester: string
  academicYear: string
  
  // Assignment and Processing
  assignedTo?: string
  assignedOfficer?: DepartmentOfficer
  department: string
  
  // Attachments
  attachments: ComplaintAttachment[]
  
  // Timeline
  submittedAt: Date
  updatedAt: Date
  resolvedAt?: Date
  
  // Communication
  responses: ComplaintResponse[]
  feedback?: ComplaintFeedback
}

export interface ComplaintAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedAt: Date
}

export interface ComplaintResponse {
  id: string
  complaintId: string
  responderId: string
  responder: User
  message: string
  isInternal: boolean
  createdAt: Date
  attachments?: ComplaintAttachment[]
}

export interface ComplaintFeedback {
  id: string
  complaintId: string
  rating: number // 1-5 stars
  comment?: string
  submittedAt: Date
}

// Department Types
export interface Department {
  id: string
  name: string
  code: string
  description?: string
  headOfDepartment?: string
  officers: DepartmentOfficer[]
  isActive: boolean
  createdAt: Date
}

// Notification Types (removed duplicate - already defined at top)

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedComplaintId?: string
  createdAt: Date
}

// Form Types
export interface ComplaintFormData {
  title: string
  description: string
  category: ComplaintCategory
  courseCode: string
  courseTitle: string
  courseLevel: string
  semester: string
  academicYear: string
  attachments?: File[]
}

export interface LoginFormData {
  email?: string
  matricule?: string
  password: string
  userType: UserRole
}

export interface RegisterFormData {
  name: string
  email: string
  matricule: string
  department: string
  yearOfStudy: number
  phoneNumber: string
  academicYear: string
  password: string
  confirmPassword: string
  verificationMethod: 'email' | 'phone'
}

export interface PasswordResetFormData {
  email?: string
  phoneNumber?: string
  recoveryMethod: 'email' | 'phone'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Types
export interface DashboardStats {
  totalComplaints: number
  pendingComplaints: number
  resolvedComplaints: number
  rejectedComplaints: number
  averageResolutionTime: number
  recentComplaints: Complaint[]
}

export interface StudentDashboardStats extends DashboardStats {
  myComplaints: number
  awaitingFeedback: number
}

export interface AdminDashboardStats extends DashboardStats {
  totalUsers: number
  totalDepartments: number
  unassignedComplaints: number
  overdueComplaints: number
}

export interface DepartmentDashboardStats extends DashboardStats {
  departmentComplaints: number
  myAssignedComplaints: number
  departmentResolutionRate: number
}

// Report Types
export interface ReportFilters {
  dateFrom?: Date
  dateTo?: Date
  department?: string
  status?: ComplaintStatus
  category?: ComplaintCategory
  assignedTo?: string
}

export interface ComplaintReport {
  filters: ReportFilters
  summary: {
    totalComplaints: number
    resolvedComplaints: number
    pendingComplaints: number
    averageResolutionTime: number
    resolutionRate: number
  }
  complaints: Complaint[]
  generatedAt: Date
}
