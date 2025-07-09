const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugOfficerData() {
  console.log('🔍 DEBUGGING OFFICER DATA LOADING ISSUE')
  console.log('=' * 50)

  try {
    // Check all users with department_officer role
    console.log('1. Checking all department officers...')
    const { data: officers, error: officersError } = await supabase
      .from('department_officers')
      .select(`
        *,
        departments(*),
        users(*)
      `)

    if (officersError) {
      console.log('❌ Error loading officers:', officersError)
    } else {
      console.log(`✅ Found ${officers.length} officers:`)
      officers.forEach((officer, index) => {
        console.log(`   ${index + 1}. User ID: ${officer.user_id}`)
        console.log(`      Name: ${officer.users?.name}`)
        console.log(`      Email: ${officer.users?.email}`)
        console.log(`      Role: ${officer.users?.role}`)
        console.log(`      Department: ${officer.departments?.name}`)
      })
    }

    // Check specific user that's having issues
    console.log('\n2. Checking specific user authentication...')

    // Try to get the officer data with different approaches
    if (officers && officers.length > 0) {
      const testUserId = officers[0].user_id
      console.log(`Testing with user ID: ${testUserId}`)

      // Test 1: Direct query
      const { data: directOfficer, error: directError } = await supabase
        .from('department_officers')
        .select(`
          *,
          departments(*)
        `)
        .eq('user_id', testUserId)
        .single()

      if (directError) {
        console.log('❌ Direct query error:', directError)
      } else {
        console.log('✅ Direct query successful:', directOfficer)
      }

      // Test 2: Check RLS policies
      console.log('\n3. Testing RLS policies...')

      // Check if the user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single()

      if (userError) {
        console.log('❌ User query error:', userError)
      } else {
        console.log('✅ User data found:', userData)
      }
    }

  } catch (error) {
    console.error('❌ Critical error:', error)
  }
}

debugOfficerData()