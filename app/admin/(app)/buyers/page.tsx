import { createAdminClient } from '@/lib/supabase/server'
import BuyersClient from './BuyersClient'

export default async function AdminBuyersPage() {
  const admin = createAdminClient()

  const { data: buyers } = await admin
    .from('profiles')
    .select('id, email, full_name, company, position, industry, country, phone, status, created_at')
    .eq('role', 'buyer')
    .order('created_at', { ascending: false })

  const stats = {
    total: buyers?.length ?? 0,
    pending: buyers?.filter(b => b.status === 'pending').length ?? 0,
    approved: buyers?.filter(b => b.status === 'approved').length ?? 0,
    rejected: buyers?.filter(b => b.status === 'rejected').length ?? 0,
  }

  return <BuyersClient buyers={buyers ?? []} stats={stats} />
}
