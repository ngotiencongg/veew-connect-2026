const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers()
  const adminUser = users?.users.find(u => u.email === 'digital@veew.vn')
  console.log('Admin user found:', !!adminUser)
  if (adminUser) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', adminUser.id).single()
    console.log('Profile:', profile)
  }
}
run()
