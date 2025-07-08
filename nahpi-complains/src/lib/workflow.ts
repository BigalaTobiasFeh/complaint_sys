import { ComplaintStatus } from '@/types'

export class WorkflowService {
  // Define valid status transitions
  static readonly STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
    'pending': ['in_progress', 'rejected'],
    'in_progress': ['resolved', 'rejected', 'pending'],
    'resolved': [], // Final state - no transitions allowed
    'rejected': ['pending', 'in_progress'] // Can be reopened
  }

  // Define required permissions for status transitions
  static readonly TRANSITION_PERMISSIONS: Record<string, string[]> = {
    'pending_to_in_progress': ['department_officer', 'admin'],
    'pending_to_rejected': ['department_officer', 'admin'],
    'in_progress_to_resolved': ['department_officer', 'admin'],
    'in_progress_to_rejected': ['department_officer', 'admin'],
    'in_progress_to_pending': ['department_officer', 'admin'],
    'rejected_to_pending': ['admin'], // Only admin can reopen rejected complaints
    'rejected_to_in_progress': ['admin']
  }

  // Define required actions for status transitions
  static readonly TRANSITION_REQUIREMENTS: Record<string, { requiresResponse: boolean; requiresAssignment: boolean }> = {
    'pending_to_in_progress': { requiresResponse: false, requiresAssignment: true },
    'pending_to_rejected': { requiresResponse: true, requiresAssignment: false },
    'in_progress_to_resolved': { requiresResponse: true, requiresAssignment: false },
    'in_progress_to_rejected': { requiresResponse: true, requiresAssignment: false },
    'in_progress_to_pending': { requiresResponse: true, requiresAssignment: false },
    'rejected_to_pending': { requiresResponse: true, requiresAssignment: false },
    'rejected_to_in_progress': { requiresResponse: true, requiresAssignment: true }
  }

  // Check if a status transition is valid
  static isValidTransition(currentStatus: ComplaintStatus, newStatus: ComplaintStatus): boolean {
    const allowedTransitions = this.STATUS_TRANSITIONS[currentStatus]
    return allowedTransitions.includes(newStatus)
  }

  // Check if user has permission for a status transition
  static hasTransitionPermission(
    currentStatus: ComplaintStatus, 
    newStatus: ComplaintStatus, 
    userRole: string
  ): boolean {
    const transitionKey = `${currentStatus}_to_${newStatus}`
    const requiredRoles = this.TRANSITION_PERMISSIONS[transitionKey]
    
    if (!requiredRoles) {
      return false // Transition not defined
    }
    
    return requiredRoles.includes(userRole)
  }

  // Get transition requirements
  static getTransitionRequirements(currentStatus: ComplaintStatus, newStatus: ComplaintStatus) {
    const transitionKey = `${currentStatus}_to_${newStatus}`
    return this.TRANSITION_REQUIREMENTS[transitionKey] || { requiresResponse: false, requiresAssignment: false }
  }

  // Validate a status transition request
  static validateTransition(
    currentStatus: ComplaintStatus,
    newStatus: ComplaintStatus,
    userRole: string,
    hasResponse: boolean = false,
    hasAssignment: boolean = false
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if transition is valid
    if (!this.isValidTransition(currentStatus, newStatus)) {
      errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`)
    }

    // Check user permissions
    if (!this.hasTransitionPermission(currentStatus, newStatus, userRole)) {
      errors.push(`You do not have permission to change status from ${currentStatus} to ${newStatus}`)
    }

    // Check requirements
    const requirements = this.getTransitionRequirements(currentStatus, newStatus)
    
    if (requirements.requiresResponse && !hasResponse) {
      errors.push('A response message is required for this status change')
    }
    
    if (requirements.requiresAssignment && !hasAssignment) {
      errors.push('Assignment to an officer is required for this status change')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get available status transitions for a user
  static getAvailableTransitions(currentStatus: ComplaintStatus, userRole: string): ComplaintStatus[] {
    const allTransitions = this.STATUS_TRANSITIONS[currentStatus]
    
    return allTransitions.filter(newStatus => 
      this.hasTransitionPermission(currentStatus, newStatus, userRole)
    )
  }

  // Get status transition metadata
  static getTransitionMetadata(currentStatus: ComplaintStatus, newStatus: ComplaintStatus) {
    const requirements = this.getTransitionRequirements(currentStatus, newStatus)
    const transitionKey = `${currentStatus}_to_${newStatus}`
    
    return {
      key: transitionKey,
      from: currentStatus,
      to: newStatus,
      requiresResponse: requirements.requiresResponse,
      requiresAssignment: requirements.requiresAssignment,
      description: this.getTransitionDescription(currentStatus, newStatus)
    }
  }

  // Get human-readable description for transitions
  static getTransitionDescription(currentStatus: ComplaintStatus, newStatus: ComplaintStatus): string {
    const descriptions: Record<string, string> = {
      'pending_to_in_progress': 'Take ownership and begin processing this complaint',
      'pending_to_rejected': 'Reject this complaint with a reason',
      'in_progress_to_resolved': 'Mark this complaint as resolved',
      'in_progress_to_rejected': 'Reject this complaint with a reason',
      'in_progress_to_pending': 'Return this complaint to pending status',
      'rejected_to_pending': 'Reopen this rejected complaint',
      'rejected_to_in_progress': 'Reopen and begin processing this complaint'
    }
    
    const key = `${currentStatus}_to_${newStatus}`
    return descriptions[key] || `Change status from ${currentStatus} to ${newStatus}`
  }

  // Get status color for UI
  static getStatusColor(status: ComplaintStatus): string {
    const colors: Record<ComplaintStatus, string> = {
      'pending': 'warning',
      'in_progress': 'info',
      'resolved': 'success',
      'rejected': 'error'
    }
    
    return colors[status] || 'default'
  }

  // Get status icon for UI
  static getStatusIcon(status: ComplaintStatus): string {
    const icons: Record<ComplaintStatus, string> = {
      'pending': 'clock',
      'in_progress': 'play',
      'resolved': 'check',
      'rejected': 'x'
    }
    
    return icons[status] || 'circle'
  }

  // Get priority level based on complaint category and age
  static calculatePriority(category: string, submittedAt: Date, currentStatus: ComplaintStatus): 'low' | 'medium' | 'high' {
    const daysSinceSubmission = Math.floor((Date.now() - submittedAt.getTime()) / (1000 * 60 * 60 * 24))
    
    // Base priority by category
    let basePriority: 'low' | 'medium' | 'high' = 'medium'
    
    if (category === 'exam_mark') {
      basePriority = 'high' // Exam marks are time-sensitive
    } else if (category === 'ca_mark') {
      basePriority = 'medium'
    } else {
      basePriority = 'low'
    }
    
    // Escalate based on age
    if (currentStatus === 'pending' && daysSinceSubmission > 3) {
      basePriority = 'high'
    } else if (currentStatus === 'in_progress' && daysSinceSubmission > 7) {
      basePriority = 'high'
    }
    
    return basePriority
  }

  // Get workflow statistics
  static getWorkflowStats(complaints: any[]) {
    const stats = {
      totalComplaints: complaints.length,
      byStatus: {
        pending: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0
      },
      averageProcessingTime: 0,
      overdueCount: 0
    }

    let totalProcessingTime = 0
    let processedCount = 0

    complaints.forEach(complaint => {
      // Count by status
      stats.byStatus[complaint.status as ComplaintStatus]++
      
      // Count by priority
      if (complaint.priority) {
        stats.byPriority[complaint.priority as 'low' | 'medium' | 'high']++
      }
      
      // Calculate processing time for resolved complaints
      if (complaint.status === 'resolved' && complaint.resolved_at) {
        const submittedAt = new Date(complaint.submitted_at)
        const resolvedAt = new Date(complaint.resolved_at)
        const processingTime = (resolvedAt.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        totalProcessingTime += processingTime
        processedCount++
      }
    })

    if (processedCount > 0) {
      stats.averageProcessingTime = Math.round(totalProcessingTime / processedCount)
    }

    return stats
  }
}
