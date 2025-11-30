require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Check if users table exists
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table is accessible');
    }

    // Test 2: Check topics table
    console.log('\n2. Checking topics table...');
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(5);
    
    if (topicsError) {
      console.error('❌ Topics table error:', topicsError.message);
    } else {
      console.log(`✅ Topics table is accessible (${topics?.length || 0} topics found)`);
      if (topics && topics.length > 0) {
        topics.forEach(t => console.log(`   - ${t.name}`));
      }
    }

    // Test 3: Check lessons table
    console.log('\n3. Checking lessons table...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .limit(5);
    
    if (lessonsError) {
      console.error('❌ Lessons table error:', lessonsError.message);
    } else {
      console.log(`✅ Lessons table is accessible (${lessons?.length || 0} lessons found)`);
    }

    // Test 4: Create a test user
    console.log('\n4. Creating test user...');
    const testEmail = 'test@example.com';
    
    // Check if user exists
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const userExists = existingAuth?.users?.some(u => u.email === testEmail);
    
    if (userExists) {
      console.log('ℹ️  Test user already exists');
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test User',
          role: 'learner'
        }
      });

      if (authError) {
        console.error('❌ Auth user creation error:', authError.message);
      } else {
        console.log('✅ Auth user created');

        // Create profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: testEmail,
            display_name: 'Test User',
            role: 'learner',
            level: 'Beginner',
            reputation: 0,
            is_active: true
          }]);

        if (profileError) {
          console.error('❌ Profile creation error:', profileError.message);
        } else {
          console.log('✅ User profile created');
          console.log(`\n🎉 Test user created successfully!`);
          console.log(`   Email: ${testEmail}`);
          console.log(`   Password: password123`);
        }
      }
    }

    console.log('\n✅ All connection tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the init_tables.sql script in Supabase SQL Editor');
    console.log('   2. Start the backend: npm run dev');
    console.log('   3. Start the frontend: npm run dev');
    console.log('   4. Login with: test@example.com / password123');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

testConnection();
