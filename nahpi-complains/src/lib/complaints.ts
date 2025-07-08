import { supabase } from './supabase'
import { ComplaintFormData, Complaint, ComplaintStatus } from '@/types'
import { NotificationService } from './notifications'
import { ErrorHandler } from './errorHandler'

export class ComplaintService {
  // Generate unique complaint ID
  static generateComplaintId(): string {
    const year = new Date().getFullYear()
    const timestamp = Date.now().toString().slice(-6)
    return `CMP-${year}-${timestamp}`
  }

  // Submit a new complaint
  static async submitComplaint(formData: ComplaintFormData, studentId: string, departmentId: string) {
    return await ErrorHandler.safeExecute(async () => {
      const complaintId = this.generateComplaintId()

      // Insert complaint record
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .insert({
          complaint_id: complaintId,
          student_id: studentId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          course_code: formData.courseCode,
          course_title: formData.courseTitle,
          course_level: formData.courseLevel,
          semester: formData.semester,
          academic_year: formData.academicYear,
          department_id: departmentId,
          status: 'pending',
          priority: 'medium'
        })
        .select()
        .single()

      if (complaintError) throw complaintError

      // Handle file attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        await this.uploadAttachments(complaint.id, formData.attachments)
      }

      // Send notifications to department officers
      await NotificationService.notifyComplaintSubmitted(complaint.id, studentId, departmentId)

      return complaint
    }, 'submitComplaint', studentId)
  }

  // Upload attachments for a complaint
  static async uploadAttachments(complaintId: string, files: File[]) {
    try {
      const attachments = []

      for (const file of files) {
        // Upload file to Supabase Storage
        const fileName = `${complaintId}/${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('complaint-attachments')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('complaint-attachments')
          .getPublicUrl(fileName)

        // Insert attachment record
        const { data: attachment, error: attachmentError } = await supabase
          .from('complaint_attachments')
          .insert({
            complaint_id: complaintId,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            file_type: file.type
          })
          .select()
          .single()

        if (attachmentError) throw attachmentError
        attachments.push(attachment)
      }

      return { success: true, attachments }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get complaints for a student
  static async getStudentComplaints(studentId: string) {
    try {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
          *,
          departments(name, code),
          complaint_attachments(*),
          complaint_responses(
            *,
            users(name, role)
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      return { success: true, complaints }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get complaints for a department
  static async getDepartmentComplaints(departmentId: string) {
    try {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            year_of_study,
            users(name, email)
          ),
          departments(name, code),
          complaint_attachments(*),
          complaint_responses(
            *,
            users(name, role)
          )
        `)
        .eq('department_id', departmentId)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      return { success: true, complaints }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get all complaints (admin)
  static async getAllComplaints() {
    try {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            year_of_study,
            users(name, email)
          ),
          departments(name, code),
          complaint_attachments(*),
          complaint_responses(
            *,
            users(name, role)
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      return { success: true, complaints }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Update complaint status
  static async updateComplaintStatus(complaintId: string, status: ComplaintStatus, officerId?: string) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'in_progress' && officerId) {
        updateData.assigned_to = officerId
      }

      if (status === 'resolved' || status === 'rejected') {
        updateData.resolved_at = new Date().toISOString()
      }

      const { data: complaint, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)
        .select()
        .single()

      if (error) throw error

      // Send notifications based on status change
      if (status === 'in_progress' && officerId) {
        await NotificationService.notifyComplaintAssigned(complaintId, officerId, officerId)
      }

      if (status === 'resolved') {
        await NotificationService.notifyComplaintResolved(complaintId, officerId || 'system')
      }

      // Always notify student of status changes
      await NotificationService.notifyComplaintStatusUpdate(complaintId, status, officerId || 'system')

      return { success: true, complaint }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Add response to complaint
  static async addComplaintResponse(complaintId: string, responderId: string, message: string, isInternal: boolean = false) {
    try {
      const { data: response, error } = await supabase
        .from('complaint_responses')
        .insert({
          complaint_id: complaintId,
          responder_id: responderId,
          message,
          is_internal: isInternal
        })
        .select(`
          *,
          users(name, role)
        `)
        .single()

      if (error) throw error

      return { success: true, response }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get complaint statistics
  static async getComplaintStats(filters?: { studentId?: string; departmentId?: string }) {
    try {
      let query = supabase
        .from('complaints')
        .select('status, submitted_at, resolved_at')

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId)
      }

      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId)
      }

      const { data: complaints, error } = await query

      if (error) throw error

      const stats = {
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === 'pending').length,
        inProgressComplaints: complaints.filter(c => c.status === 'in_progress').length,
        resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
        rejectedComplaints: complaints.filter(c => c.status === 'rejected').length,
        averageResolutionTime: this.calculateAverageResolutionTime(complaints)
      }

      return { success: true, stats }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Calculate average resolution time in days
  private static calculateAverageResolutionTime(complaints: any[]): number {
    const resolvedComplaints = complaints.filter(c => c.resolved_at)
    
    if (resolvedComplaints.length === 0) return 0

    const totalTime = resolvedComplaints.reduce((sum, complaint) => {
      const submitted = new Date(complaint.submitted_at)
      const resolved = new Date(complaint.resolved_at)
      const diffTime = resolved.getTime() - submitted.getTime()
      const diffDays = diffTime / (1000 * 3600 * 24)
      return sum + diffDays
    }, 0)

    return Math.round(totalTime / resolvedComplaints.length)
  }
}
