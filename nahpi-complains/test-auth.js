// Test Authentication with Your Credentials
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qbxgswcslywltbuoqnbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGdzd2NzbHl3bHRidW9xbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc3MjMsImV4cCI6MjA2NzU0MzcyM30.2pNYsPgki4BRmdAahh7-a8i8xAnfz38cTRPe2FoHO4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🧪 Testing Authentication with Your Credentials\n');

  // Test credentials
  const credentials = {
    student: { matricule: 'UBa25T1000', password: 'Nahpi$hust123' },
    admin: { email: 'admin01@nahpi.edu', password: 'admin123' },
    officer: { email: 'officer.com@nahpi.edu', password: 'dept123' }
  };

  // Test 1: Check if departments exist
  console.log('📋 Step 1: Checking departments...');
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*');
    
    if (error) {
      console.error('❌ Departments error:', error);
    } else {
      console.log('✅ Departments found:', departments.length);
      departments.forEach(dept => console.log(`   - ${dept.code}: ${dept.name}`));
    }
  } catch (err) {
    console.error('❌ Departments fetch failed:', err.message);
  }

  // Test 2: Check users table
  console.log('\n👥 Step 2: Checking users table...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Users table error:', error);
    } else {
      console.log('✅ Users found:', users.length);
      users.forEach(user => console.log(`   - ${user.email} (${user.role})`));
    }
  } catch (err) {
    console.error('❌ Users fetch failed:', err.message);
  }

  // Test 3: Try admin authentication
  console.log('\n🔐 Step 3: Testing Admin Authentication...');
  try {
    const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
      email: credentials.admin.email,
      password: credentials.admin.password
    });

    if (adminError) {
      console.error('❌ Admin auth failed:', adminError.message);
    } else {
      console.log('✅ Admin auth successful:', adminAuth.user.email);
      
      // Check if admin has profile
      const { data: adminProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', adminAuth.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Admin profile not found:', profileError.message);
        console.log('   User ID:', adminAuth.user.id);
      } else {
        console.log('✅ Admin profile found:', adminProfile.name, adminProfile.role);
      }
      
      // Sign out
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('❌ Admin auth exception:', err.message);
  }

  // Test 4: Try department officer authentication
  console.log('\n🏢 Step 4: Testing Department Officer Authentication...');
  try {
    const { data: officerAuth, error: officerError } = await supabase.auth.signInWithPassword({
      email: credentials.officer.email,
      password: credentials.officer.password
    });

    if (officerError) {
      console.error('❌ Officer auth failed:', officerError.message);
    } else {
      console.log('✅ Officer auth successful:', officerAuth.user.email);
      
      // Check if officer has profile
      const { data: officerProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', officerAuth.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Officer profile not found:', profileError.message);
        console.log('   User ID:', officerAuth.user.id);
      } else {
        console.log('✅ Officer profile found:', officerProfile.name, officerProfile.role);
      }
      
      // Sign out
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('❌ Officer auth exception:', err.message);
  }

  // Test 5: Try student authentication
  console.log('\n🎓 Step 5: Testing Student Authentication...');
  try {
    // First, find student by matricule
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        matricule,
        users!inner(email)
      `)
      .eq('matricule', credentials.student.matricule)
      .single();

    if (studentError) {
      console.error('❌ Student lookup failed:', studentError.message);
    } else {
      console.log('✅ Student found:', student.matricule, student.users.email);
      
      // Try to authenticate with student's email
      const { data: studentAuth, error: authError } = await supabase.auth.signInWithPassword({
        email: student.users.email,
        password: credentials.student.password
      });

      if (authError) {
        console.error('❌ Student auth failed:', authError.message);
      } else {
        console.log('✅ Student auth successful:', studentAuth.user.email);
        await supabase.auth.signOut();
      }
    }
  } catch (err) {
    console.error('❌ Student auth exception:', err.message);
  }

  // Test 6: List all auth users
  console.log('\n📊 Step 6: Summary...');
  console.log('If authentication succeeded but profiles are missing, you need to:');
  console.log('1. Run the fix-infinite-recursion.sql script');
  console.log('2. Create user profiles in the users table');
  console.log('3. Link admin/officer profiles to their respective tables');
}

testAuth().catch(console.error);
