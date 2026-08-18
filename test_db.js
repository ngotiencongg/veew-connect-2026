require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('--- Kiểm tra bảng profiles ---');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Lỗi truy vấn profiles:', error);
  } else {
    console.log('Cột trong profiles:', data.length > 0 ? Object.keys(data[0]) : 'Chưa có data');
  }

  // Tạo một auth user ảo để xem trigger có chạy và ném lỗi/thành công không
  console.log('--- Tạo auth user để test trigger ---');
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: 'test_trigger_new@veew.vn',
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Test Name', full_name: 'Test Full Name', role: 'buyer' }
  });
  
  if (authErr) {
    console.error('Lỗi tạo user:', authErr.message);
  } else {
    console.log('Tạo user thành công ID:', authData.user.id);
    // Chờ 1 giây để trigger chạy
    await new Promise(r => setTimeout(r, 1000));
    
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
    if (profile) {
      console.log('Trigger ĐÃ TẠO profile tự động:', profile);
    } else {
      console.log('KHÔNG có profile tự động tạo -> Không có trigger (hoặc trigger lỗi).');
    }
    
    // Xóa user sau khi test
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('Đã xóa user test.');
  }
}
run();
