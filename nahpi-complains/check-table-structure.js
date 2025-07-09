const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableStructure() {
  console.log('🔍 CHECKING TABLE STRUCTURE')
  console.log('=' * 50)
  
  try {
    // Check department_officers table structure
    console.log('1. Checking department_officers table...')
    const { data: officers, error: officersError } = await supabase
      .from('department_officers')
      .select('*')
      .limit(1)
    
    if (officersError) {
      console.log('❌ Error:', officersError)
    } else {
      console.log('✅ Department Officers columns:', Object.keys(officers[0] || {}))
      console.log('Sample data:', officers[0])
    }
    
    // Check users table
    console.log('\n2. Checking users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'department_officer')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Error:', usersError)
    } else {
      console.log('✅ Users with department_officer role:', users.length)
      if (users.length > 0) {
        console.log('Sample user:', users[0])
      }
    }
    
    // Check if there's a relationship between users and department_officers
    console.log('\n3. Checking relationship...')
    
    // Try different approaches to find the connection
    const { data: allOfficers, error: allOfficersError } = await supabase
      .from('department_officers')
      .select('*')
    
    if (!allOfficersError && allOfficers) {
      console.log('All department officers:')
      allOfficers.forEach((officer, index) => {
        console.log(`${index + 1}.`, officer)
      })
    }
    
  } catch (error) {
    console.error('❌ Critical error:', error)
  }
}

checkTableStructure()
