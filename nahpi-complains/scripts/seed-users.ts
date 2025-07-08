import { AuthService } from '../src/lib/auth'

async function seedUsers() {
  console.log('🌱 Starting user seeding...')

  try {
    // Create admin user
    console.log('Creating admin user...')
    const adminResult = await AuthService.createAdmin(
      'admin@nahpi.edu',
      'admin123456',
      'System Administrator'
    )
    
    if (adminResult.success) {
      console.log('✅ Admin user created successfully')
    } else {
      console.log('❌ Failed to create admin user:', adminResult.error)
    }

    // Create department officers for each department
    const departments = [
      { code: 'CMC', name: 'Centre for Cybersecurity and Mathematical Cryptology' },
      { code: 'CBE', name: 'Chemical and Biological Engineering' },
      { code: 'CVL', name: 'Civil Engineering and Architecture' },
      { code: 'COM', name: 'Computer Engineering' },
      { code: 'EEEE', name: 'Electrical and Electronics Engineering' },
      { code: 'MEC', name: 'Mechanical and Industrial Engineering' },
      { code: 'MIN', name: 'Mining and Mineral Engineering' },
      { code: 'PET', name: 'Petroleum Engineering' }
    ]

    for (const dept of departments) {
      console.log(`Creating department officer for ${dept.name}...`)
      const officerResult = await AuthService.createDepartmentOfficer(
        `officer.${dept.code.toLowerCase()}@nahpi.edu`,
        'officer123456',
        `${dept.name} Officer`,
        dept.code,
        'Department Officer'
      )
      
      if (officerResult.success) {
        console.log(`✅ Department officer for ${dept.code} created successfully`)
      } else {
        console.log(`❌ Failed to create department officer for ${dept.code}:`, officerResult.error)
      }
    }

    console.log('🎉 User seeding completed!')
    console.log('\n📋 Test Credentials:')
    console.log('Admin Login:')
    console.log('  Email: admin@nahpi.edu')
    console.log('  Password: admin123456')
    console.log('\nDepartment Officer Login (example):')
    console.log('  Email: officer.com@nahpi.edu')
    console.log('  Password: officer123456')
    console.log('\nStudent Registration:')
    console.log('  Use the registration form to create student accounts')
    console.log('  Matricule format: UBa25T1000 (UBa + year + letter + 4 digits)')
    console.log('  Example: UBa25A0001, UBa24Z9999, UBa25T1000')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
  }
}

// Run the seeding function
seedUsers()
