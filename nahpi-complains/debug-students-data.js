const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugStudentsData() {
  console.log('🔍 DEBUGGING DEPARTMENT STUDENTS DATA')
  console.log('=' * 50)
  
  try {
    // 1. Check department officers
    console.log('1. Checking department officers...')
    const { data: officers, error: officersError } = await supabase
      .from('department_officers')
      .select(`
        *,
        departments(*),
        users(*)
      `)
    
    if (officersError) {
      console.log('❌ Error loading officers:', officersError.message)
      return
    }
    
    console.log(`✅ Found ${officers.length} department officers:`)
    officers.forEach((officer, index) => {
      console.log(`   ${index + 1}. ${officer.users?.name} (${officer.users?.email})`)
      console.log(`      Department: ${officer.departments?.name} (ID: ${officer.department_id})`)
    })
    
    // 2. Check all students
    console.log('\n2. Checking all students...')
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        users(
          id,
          name,
          email,
          is_active,
          created_at
        )
      `)
    
    if (studentsError) {
      console.log('❌ Error loading students:', studentsError.message)
      return
    }
    
    console.log(`✅ Found ${allStudents.length} total students:`)
    allStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.users?.name} (${student.matricule})`)
      console.log(`      Department ID: ${student.department_id}`)
      console.log(`      Active: ${student.users?.is_active}`)
    })
    
    // 3. Check departments
    console.log('\n3. Checking departments...')
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
    
    if (deptError) {
      console.log('❌ Error loading departments:', deptError.message)
      return
    }
    
    console.log(`✅ Found ${departments.length} departments:`)
    departments.forEach((dept, index) => {
      console.log(`   ${index + 1}. ${dept.name} (${dept.code}) - ID: ${dept.id}`)
    })
    
    // 4. Test specific department query
    if (officers.length > 0) {
      const testOfficer = officers[0]
      console.log(`\n4. Testing query for officer: ${testOfficer.users?.name}`)
      console.log(`   Department ID: ${testOfficer.department_id}`)
      
      const { data: deptStudents, error: deptStudentsError } = await supabase
        .from('students')
        .select(`
          *,
          users(
            id,
            name,
            email,
            is_active,
            created_at
          )
        `)
        .eq('department_id', testOfficer.department_id)
      
      if (deptStudentsError) {
        console.log('❌ Error loading department students:', deptStudentsError.message)
      } else {
        console.log(`✅ Found ${deptStudents.length} students in department ${testOfficer.departments?.name}:`)
        deptStudents.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.users?.name} (${student.matricule})`)
        })
      }
    }
    
    // 5. Check for data mismatches
    console.log('\n5. Checking for data mismatches...')
    const departmentIds = departments.map(d => d.id)
    const officerDeptIds = officers.map(o => o.department_id)
    const studentDeptIds = [...new Set(allStudents.map(s => s.department_id))]
    
    console.log('Department IDs:', departmentIds)
    console.log('Officer Department IDs:', officerDeptIds)
    console.log('Student Department IDs:', studentDeptIds)
    
    // Check for orphaned students
    const orphanedStudents = allStudents.filter(s => !departmentIds.includes(s.department_id))
    if (orphanedStudents.length > 0) {
      console.log(`⚠️ Found ${orphanedStudents.length} students with invalid department_id:`)
      orphanedStudents.forEach(student => {
        console.log(`   - ${student.users?.name} (dept_id: ${student.department_id})`)
      })
    }
    
    // Check for departments without students
    const deptsWithoutStudents = departments.filter(d => !studentDeptIds.includes(d.id))
    if (deptsWithoutStudents.length > 0) {
      console.log(`⚠️ Found ${deptsWithoutStudents.length} departments without students:`)
      deptsWithoutStudents.forEach(dept => {
        console.log(`   - ${dept.name} (ID: ${dept.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Critical error:', error)
  }
}

debugStudentsData()
