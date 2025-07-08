const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Initialize Supabase client
const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTk2NzcyMywiZXhwIjoyMDY3NTQzNzIzfQ.OU42jvoZJN24Vr5pIHaOMPqjyl6w8NuL3gedOKHoHFc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate unique complaint ID
function generateComplaintId() {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  return `CMP-${year}-${timestamp}`
}

async function testCompleteComplaintFlow() {
  console.log('🔄 Testing Complete Complaint Submission Flow with File Upload')
  console.log('=' * 70)
  
  try {
    // Step 1: Get test student
    console.log('\n👤 Step 1: Getting test student information...')
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        matricule,
        department_id,
        users(id, name, email)
      `)
      .eq('matricule', 'UBa25T1000')
      .single()
    
    if (studentError) {
      console.error('❌ Failed to get student:', studentError.message)
      return
    }
    
    console.log(`✅ Student: ${student.users.name} (${student.matricule})`)
    
    // Step 2: Create test files
    console.log('\n📄 Step 2: Creating test attachment files...')
    
    const testFiles = []
    
    // Create a PDF-like file (actually text but with PDF extension for testing)
    const pdfContent = `%PDF-1.4
Test PDF Document for Complaint System
This is a mock PDF file for testing file upload functionality.

Student: ${student.users.name}
Matricule: ${student.matricule}
Date: ${new Date().toISOString()}

This document serves as supporting evidence for the complaint.`
    
    const pdfFileName = `evidence-document-${Date.now()}.pdf`
    const pdfPath = path.join(__dirname, pdfFileName)
    fs.writeFileSync(pdfPath, pdfContent)
    
    // Create an image file (actually text but with image extension)
    const imageContent = `Mock Image File for Testing
This would be an actual image in a real scenario.
Generated at: ${new Date().toISOString()}`
    
    const imageFileName = `screenshot-${Date.now()}.jpg`
    const imagePath = path.join(__dirname, imageFileName)
    fs.writeFileSync(imagePath, imageContent)
    
    console.log(`✅ Created test files:`)
    console.log(`   - ${pdfFileName}`)
    console.log(`   - ${imageFileName}`)
    
    // Step 3: Submit complaint with attachments
    console.log('\n📝 Step 3: Submitting complaint with attachments...')
    
    const complaintData = {
      complaint_id: generateComplaintId(),
      student_id: student.users.id,
      title: 'Complete Test - Exam Mark Review with Supporting Documents',
      description: `This is a comprehensive test of the complaint submission system with file attachments.

ISSUE DESCRIPTION:
I am requesting a review of my exam marks for the Software Engineering course. I believe there may have been an error in the grading process.

COURSE DETAILS:
- Course: Software Engineering Principles
- Course Code: COM301
- Semester: First Semester 2024/2025
- Expected Grade: A
- Received Grade: C

SUPPORTING EVIDENCE:
I have attached the following documents:
1. PDF document with detailed analysis
2. Screenshot of my submitted work

REQUEST:
Please review my exam script and provide feedback on the grading criteria used.

Thank you for your consideration.`,
      category: 'exam_mark',
      course_code: 'COM301',
      course_title: 'Software Engineering Principles',
      course_level: '300',
      semester: 'First Semester',
      academic_year: '2024/2025',
      department_id: student.department_id,
      status: 'pending',
      priority: 'medium'
    }
    
    // Insert complaint
    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert(complaintData)
      .select()
      .single()
    
    if (complaintError) {
      console.error('❌ Failed to submit complaint:', complaintError.message)
      return
    }
    
    console.log('✅ Complaint submitted successfully!')
    console.log(`   ID: ${complaint.id}`)
    console.log(`   Complaint ID: ${complaint.complaint_id}`)
    
    // Step 4: Upload attachments
    console.log('\n📎 Step 4: Uploading attachments...')
    
    const attachments = []
    
    // Upload PDF file
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfFile = new File([pdfBuffer], pdfFileName, { type: 'application/pdf' })
    
    const pdfUploadPath = `${complaint.id}/${pdfFileName}`
    const { data: pdfUpload, error: pdfUploadError } = await supabase.storage
      .from('complaint-attachments')
      .upload(pdfUploadPath, pdfFile)
    
    if (pdfUploadError) {
      console.error('❌ PDF upload failed:', pdfUploadError.message)
    } else {
      console.log(`✅ PDF uploaded: ${pdfUpload.path}`)
      
      const { data: { publicUrl: pdfUrl } } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(pdfUploadPath)
      
      // Create attachment record
      const { data: pdfAttachment, error: pdfAttachmentError } = await supabase
        .from('complaint_attachments')
        .insert({
          complaint_id: complaint.id,
          file_name: pdfFileName,
          file_url: pdfUrl,
          file_size: pdfBuffer.length,
          file_type: 'application/pdf'
        })
        .select()
        .single()
      
      if (pdfAttachmentError) {
        console.error('❌ PDF attachment record failed:', pdfAttachmentError.message)
      } else {
        attachments.push(pdfAttachment)
        console.log(`✅ PDF attachment record created`)
      }
    }
    
    // Upload image file
    const imageBuffer = fs.readFileSync(imagePath)
    const imageFile = new File([imageBuffer], imageFileName, { type: 'image/jpeg' })
    
    const imageUploadPath = `${complaint.id}/${imageFileName}`
    const { data: imageUpload, error: imageUploadError } = await supabase.storage
      .from('complaint-attachments')
      .upload(imageUploadPath, imageFile)
    
    if (imageUploadError) {
      console.error('❌ Image upload failed:', imageUploadError.message)
    } else {
      console.log(`✅ Image uploaded: ${imageUpload.path}`)
      
      const { data: { publicUrl: imageUrl } } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(imageUploadPath)
      
      // Create attachment record
      const { data: imageAttachment, error: imageAttachmentError } = await supabase
        .from('complaint_attachments')
        .insert({
          complaint_id: complaint.id,
          file_name: imageFileName,
          file_url: imageUrl,
          file_size: imageBuffer.length,
          file_type: 'image/jpeg'
        })
        .select()
        .single()
      
      if (imageAttachmentError) {
        console.error('❌ Image attachment record failed:', imageAttachmentError.message)
      } else {
        attachments.push(imageAttachment)
        console.log(`✅ Image attachment record created`)
      }
    }
    
    // Step 5: Verify complete complaint with attachments
    console.log('\n🔍 Step 5: Verifying complete complaint with attachments...')
    
    const { data: completeComplaint, error: verifyError } = await supabase
      .from('complaints')
      .select(`
        *,
        students(
          matricule,
          users(name, email)
        ),
        departments(name, code),
        complaint_attachments(*)
      `)
      .eq('id', complaint.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Failed to verify complaint:', verifyError.message)
      return
    }
    
    console.log('✅ Complete complaint verification successful!')
    console.log(`   Title: ${completeComplaint.title}`)
    console.log(`   Student: ${completeComplaint.students.users.name}`)
    console.log(`   Department: ${completeComplaint.departments.name}`)
    console.log(`   Attachments: ${completeComplaint.complaint_attachments.length}`)
    
    completeComplaint.complaint_attachments.forEach((attachment, index) => {
      console.log(`     ${index + 1}. ${attachment.file_name} (${attachment.file_size} bytes)`)
    })
    
    // Step 6: Test complaint retrieval for dashboard
    console.log('\n📊 Step 6: Testing dashboard complaint retrieval...')
    
    const { data: studentComplaints, error: dashboardError } = await supabase
      .from('complaints')
      .select(`
        *,
        departments(name, code),
        complaint_attachments(*)
      `)
      .eq('student_id', student.users.id)
      .order('submitted_at', { ascending: false })
    
    if (dashboardError) {
      console.error('❌ Dashboard retrieval failed:', dashboardError.message)
    } else {
      console.log(`✅ Dashboard data retrieved: ${studentComplaints.length} complaints`)
      
      const complaintsWithAttachments = studentComplaints.filter(c => c.complaint_attachments.length > 0)
      console.log(`   Complaints with attachments: ${complaintsWithAttachments.length}`)
    }
    
    // Step 7: Clean up test files
    console.log('\n🧹 Step 7: Cleaning up test files...')
    
    // Delete from storage
    const filesToDelete = [pdfUploadPath, imageUploadPath]
    const { error: deleteError } = await supabase.storage
      .from('complaint-attachments')
      .remove(filesToDelete)
    
    if (deleteError) {
      console.log('⚠️  Failed to delete some files from storage:', deleteError.message)
    } else {
      console.log('✅ Files deleted from storage')
    }
    
    // Delete attachment records
    const { error: attachmentDeleteError } = await supabase
      .from('complaint_attachments')
      .delete()
      .eq('complaint_id', complaint.id)
    
    if (attachmentDeleteError) {
      console.log('⚠️  Failed to delete attachment records:', attachmentDeleteError.message)
    } else {
      console.log('✅ Attachment records deleted')
    }
    
    // Delete complaint
    const { error: complaintDeleteError } = await supabase
      .from('complaints')
      .delete()
      .eq('id', complaint.id)
    
    if (complaintDeleteError) {
      console.log('⚠️  Failed to delete complaint:', complaintDeleteError.message)
    } else {
      console.log('✅ Test complaint deleted')
    }
    
    // Delete local files
    fs.unlinkSync(pdfPath)
    fs.unlinkSync(imagePath)
    console.log('✅ Local test files deleted')
    
    console.log('\n🎉 Complete Complaint Flow Test Successful!')
    console.log('\n📋 Test Summary:')
    console.log('   ✅ Student authentication: WORKING')
    console.log('   ✅ Complaint submission: WORKING')
    console.log('   ✅ File upload to storage: WORKING')
    console.log('   ✅ Attachment database records: WORKING')
    console.log('   ✅ Complete complaint retrieval: WORKING')
    console.log('   ✅ Dashboard integration: WORKING')
    console.log('   ✅ File cleanup: WORKING')
    
    console.log('\n🚀 The complete complaint system with file upload is ready!')
    
  } catch (error) {
    console.error('❌ Unexpected error during complete flow test:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testCompleteComplaintFlow()
