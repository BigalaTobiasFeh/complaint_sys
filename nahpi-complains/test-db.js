const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('departments')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message)
      return
    }
    
    console.log('✅ Database connection successful!')
    
    // Test 2: Check departments table
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
    
    if (deptError) {
      console.error('❌ Departments table error:', deptError.message)
    } else {
      console.log(`✅ Found ${departments.length} departments:`)
      departments.forEach(dept => {
        console.log(`   - ${dept.name} (${dept.code})`)
      })
    }
    
    // Test 3: Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message)
    } else {
      console.log(`✅ Found ${users.length} users (showing first 5):`)
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
      })
    }
    
    // Test 4: Check students table
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        matricule,
        year_of_study,
        users(name, email)
      `)
      .limit(3)
    
    if (studentsError) {
      console.error('❌ Students table error:', studentsError.message)
    } else {
      console.log(`✅ Found ${students.length} students (showing first 3):`)
      students.forEach(student => {
        console.log(`   - ${student.users.name} (${student.matricule}) - Year ${student.year_of_study}`)
      })
    }
    
    // Test 5: Check complaints table
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('id, title, status, submitted_at')
      .limit(3)
    
    if (complaintsError) {
      console.error('❌ Complaints table error:', complaintsError.message)
    } else {
      console.log(`✅ Found ${complaints.length} complaints (showing first 3):`)
      complaints.forEach(complaint => {
        console.log(`   - ${complaint.title} (${complaint.status}) - ${new Date(complaint.submitted_at).toLocaleDateString()}`)
      })
    }
    
    console.log('\n🎉 Database test completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the test
testDatabase()
