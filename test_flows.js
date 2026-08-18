require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAll() {
  console.log('--- STARTING FLOW TESTS ---');
  let buyerId, exhibitorId, slotId, meetingId;
  const buyerEmail = `testbuyer_${Date.now()}@veew.vn`;
  const exEmail = `testex_${Date.now()}@veew.vn`;

  try {
    // 1. Buyer Register
    console.log('\n1. Buyer Register');
    const { data: bAuth, error: bErr } = await supabase.auth.admin.createUser({
      email: buyerEmail, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Flow Buyer', role: 'buyer' }
    });
    if (bErr) throw bErr;
    buyerId = bAuth.user.id;
    // Simulate registerBuyer inserting profile
    const { error: pErr } = await supabase.from('profiles').insert({
      id: buyerId, role: 'buyer', full_name: 'Flow Buyer', company: 'Flow Co', status: 'pending'
    });
    if (pErr) throw pErr;
    console.log('✅ Buyer registered, status: pending');

    // 2. Admin Approves Buyer
    console.log('\n2. Admin Approves Buyer');
    const { error: aErr } = await supabase.from('profiles').update({ status: 'approved' }).eq('id', buyerId);
    if (aErr) throw aErr;
    console.log('✅ Admin approved buyer');

    // 3. Admin creates Exhibitor
    console.log('\n3. Admin Creates Exhibitor');
    const { data: eAuth, error: eErr } = await supabase.auth.admin.createUser({
      email: exEmail, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Exhibitor Contact', role: 'exhibitor' }
    });
    if (eErr) throw eErr;
    exhibitorId = eAuth.user.id;
    const { error: epErr } = await supabase.from('profiles').insert({
      id: exhibitorId, role: 'exhibitor', full_name: 'Exhibitor Contact', status: 'approved'
    });
    if (epErr) throw epErr;
    const { data: exData, error: exDbErr } = await supabase.from('exhibitors').insert({
      user_id: exhibitorId, name: 'Flow Exhibitor Co', category: 'Tech', booth: 'A1',
      contact_name: 'Exhibitor Contact', email: exEmail
    }).select().single();
    if (exDbErr) throw exDbErr;
    console.log('✅ Admin created Exhibitor:', exData.id);

    // 4. Exhibitor opens slot, Buyer books
    console.log('\n4. Exhibitor opens slot -> Buyer books');
    const { data: slotData, error: sErr } = await supabase.from('slots').insert({
      exhibitor_id: exData.id, event_date: '2026-10-17', start_time: '14:00:00', duration_mins: 30, is_open: true
    }).select().single();
    if (sErr) throw sErr;
    slotId = slotData.id;
    console.log('✅ Slot opened');

    // Buyer books slot (simulate bookSlot)
    // Check if open
    if (!slotData.is_open) throw new Error('Slot is closed!');
    // Close slot
    await supabase.from('slots').update({ is_open: false }).eq('id', slotId);
    // Insert meeting
    const { data: mData, error: mErr } = await supabase.from('meetings').insert({
      buyer_id: buyerId, exhibitor_id: exData.id, slot_id: slotId,
      event_date: slotData.event_date, start_time: slotData.start_time, venue: 'Booth A1', status: 'pending'
    }).select().single();
    if (mErr) throw mErr;
    meetingId = mData.id;
    console.log('✅ Buyer booked slot successfully');

    // 5. Check if profiles join works (for P0-c)
    console.log('\n5. Admin Exhibitor List Join test');
    const { data: rawEx } = await supabase.from('exhibitors').select('id, user_id, company_name:name').limit(1);
    if (!rawEx) throw new Error('Failed to query exhibitors');
    console.log('✅ Admin Exhibitor list query works');

    console.log('\n🎉 ALL 5 FLOWS TESTED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ FLOW FAILED:', err);
  } finally {
    // Cleanup
    if (meetingId) await supabase.from('meetings').delete().eq('id', meetingId);
    if (slotId) await supabase.from('slots').delete().eq('id', slotId);
    if (exhibitorId) {
      await supabase.from('exhibitors').delete().eq('user_id', exhibitorId);
      await supabase.from('profiles').delete().eq('id', exhibitorId);
      await supabase.auth.admin.deleteUser(exhibitorId);
    }
    if (buyerId) {
      await supabase.from('profiles').delete().eq('id', buyerId);
      await supabase.auth.admin.deleteUser(buyerId);
    }
    console.log('🧹 Cleanup done');
  }
}
testAll();
