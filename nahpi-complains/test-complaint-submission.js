const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q'

const supabase = createClient(supabaseUrl, supabaseKey)

// Generate unique complaint ID
function generateComplaintId() {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  return `CMP-${year}-${timestamp}`
}

async function testComplaintSubmission() {
  console.log('🧪 Testing complaint submission functionality...\n')
  
  try {
    // Step 1: Get student information
    console.log('📋 Step 1: Getting student information...')
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
    
    console.log(`✅ Found student: ${student.users.name} (${student.matricule})`)
    console.log(`   Department ID: ${student.department_id}`)
    
    // Step 2: Get department information
    console.log('\n📋 Step 2: Getting department information...')
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('id', student.department_id)
      .single()
    
    if (deptError) {
      console.error('❌ Failed to get department:', deptError.message)
      return
    }
    
    console.log(`✅ Department: ${department.name} (${department.code})`)
    
    // Step 3: Create test complaint data
    console.log('\n📋 Step 3: Preparing complaint data...')
    const complaintData = {
      complaint_id: generateComplaintId(),
      student_id: student.users.id,
      title: 'Test CA Mark Discrepancy - Mathematics Course',
      description: `Dear Department,

I am writing to formally report a discrepancy in my Continuous Assessment (CA) marks for the Mathematics course (MATH201) for the First Semester of the 2024/2025 academic year.

Issue Details:
- Course: Advanced Calculus (MATH201)
- Expected CA Score: 18/20 (based on my individual assignment scores)
- Recorded CA Score: 12/20 (as shown in the portal)

Supporting Evidence:
1. Assignment 1: 9/10 (submitted on time)
2. Assignment 2: 9/10 (submitted on time)
3. Total Expected: 18/20

I have double-checked my calculations and believe there may have been an error in the recording or calculation of my CA marks. I would appreciate if this could be reviewed and corrected if necessary.

Thank you for your time and consideration.

Best regards,
${student.users.name}
Matricule: ${student.matricule}`,
      category: 'ca_mark',
      course_code: 'MATH201',
      course_title: 'Advanced Calculus',
      course_level: '200',
      semester: 'First Semester',
      academic_year: '2024/2025',
      department_id: student.department_id,
      status: 'pending',
      priority: 'medium'
    }
    
    console.log(`✅ Complaint prepared:`)
    console.log(`   ID: ${complaintData.complaint_id}`)
    console.log(`   Title: ${complaintData.title}`)
    console.log(`   Category: ${complaintData.category}`)
    console.log(`   Course: ${complaintData.course_code} - ${complaintData.course_title}`)
    
    // Step 4: Submit the complaint
    console.log('\n📋 Step 4: Submitting complaint to database...')
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
    console.log(`   Database ID: ${complaint.id}`)
    console.log(`   Submitted at: ${new Date(complaint.submitted_at).toLocaleString()}`)
    
    // Step 5: Verify the complaint was saved correctly
    console.log('\n📋 Step 5: Verifying complaint in database...')
    const { data: savedComplaint, error: verifyError } = await supabase
      .from('complaints')
      .select(`
        *,
        students(
          matricule,
          users(name, email)
        ),
        departments(name, code)
      `)
      .eq('id', complaint.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Failed to verify complaint:', verifyError.message)
      return
    }
    
    console.log('✅ Complaint verification successful!')
    console.log(`   Student: ${savedComplaint.students.users.name}`)
    console.log(`   Department: ${savedComplaint.departments.name}`)
    console.log(`   Status: ${savedComplaint.status}`)
    console.log(`   Priority: ${savedComplaint.priority}`)
    
    // Step 6: Test complaint retrieval (simulate dashboard view)
    console.log('\n📋 Step 6: Testing complaint retrieval for student dashboard...')
    const { data: studentComplaints, error: retrieveError } = await supabase
      .from('complaints')
      .select(`
        *,
        departments(name, code)
      `)
      .eq('student_id', student.users.id)
      .order('submitted_at', { ascending: false })
    
    if (retrieveError) {
      console.error('❌ Failed to retrieve complaints:', retrieveError.message)
      return
    }
    
    console.log(`✅ Retrieved ${studentComplaints.length} complaint(s) for student`)
    studentComplaints.forEach((c, index) => {
      console.log(`   ${index + 1}. ${c.title} (${c.status}) - ${new Date(c.submitted_at).toLocaleDateString()}`)
    })
    
    // Step 7: Test department officer view
    console.log('\n📋 Step 7: Testing department officer complaint view...')
    const { data: deptComplaints, error: deptRetrieveError } = await supabase
      .from('complaints')
      .select(`
        *,
        students(
          matricule,
          users(name, email)
        )
      `)
      .eq('department_id', student.department_id)
      .order('submitted_at', { ascending: false })
    
    if (deptRetrieveError) {
      console.error('❌ Failed to retrieve department complaints:', deptRetrieveError.message)
      return
    }
    
    console.log(`✅ Retrieved ${deptComplaints.length} complaint(s) for department`)
    deptComplaints.forEach((c, index) => {
      console.log(`   ${index + 1}. ${c.title} by ${c.students.users.name} (${c.status})`)
    })
    
    console.log('\n🎉 Complaint submission test completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('   ✅ Database connection working')
    console.log('   ✅ Student data retrieval working')
    console.log('   ✅ Department data retrieval working')
    console.log('   ✅ Complaint submission working')
    console.log('   ✅ Complaint verification working')
    console.log('   ✅ Student dashboard data retrieval working')
    console.log('   ✅ Department officer data retrieval working')
    console.log('\n🚀 The complaint management system is ready for use!')
    
  } catch (error) {
    console.error('❌ Unexpected error during test:', error.message)
  }
}

// Run the test
testComplaintSubmission()
