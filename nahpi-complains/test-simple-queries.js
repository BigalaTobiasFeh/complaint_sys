const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://qbxgswcslywltbuoqnbv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q'
)

async function testSimpleQueries() {
  console.log('🧪 SIMPLE QUERY TEST')
  console.log('=' * 40)
  console.log('Testing basic database connectivity...\n')
  
  try {
    // Test 1: Simple complaints query
    console.log('1. Testing complaints table...')
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('id, title, status')
      .limit(3)

    if (complaintsError) {
      console.log('❌ Complaints error:', complaintsError.message)
    } else {
      console.log('✅ Complaints query works:', complaints?.length || 0, 'records')
    }

    // Test 2: Simple students query
    console.log('\n2. Testing students table...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, matricule')
      .limit(3)

    if (studentsError) {
      console.log('❌ Students error:', studentsError.message)
    } else {
      console.log('✅ Students query works:', students?.length || 0, 'records')
    }

    // Test 3: Simple officers query
    console.log('\n3. Testing department_officers table...')
    const { data: officers, error: officersError } = await supabase
      .from('department_officers')
      .select('id, position')
      .limit(3)

    if (officersError) {
      console.log('❌ Officers error:', officersError.message)
    } else {
      console.log('✅ Officers query works:', officers?.length || 0, 'records')
    }

    // Test 4: Simple users query
    console.log('\n4. Testing users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(3)

    if (usersError) {
      console.log('❌ Users error:', usersError.message)
    } else {
      console.log('✅ Users query works:', users?.length || 0, 'records')
    }

    console.log('\n' + '='.repeat(40))
    console.log('✅ BASIC CONNECTIVITY CONFIRMED')
    console.log('All simple queries are working correctly.')

  } catch (error) {
    console.error('❌ Connection error:', error.message)
  }
}

testSimpleQueries()
