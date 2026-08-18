import { createAdminClient } from '@/lib/supabase/server'
import ExhibitorsAdminClient from './ExhibitorsAdminClient'

export default async function AdminExhibitorsPage() {
  const admin = createAdminClient()

  const { data: rawExhibitors } = await admin
    .from('exhibitors')
    .select('id, user_id, company_name:name, category, booth_number:booth, description, website')
    .order('name')

  let exhibitors = rawExhibitors ?? []
  if (exhibitors.length > 0) {
    const userIds = exhibitors.map(e => e.user_id).filter(Boolean)
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, full_name, phone, country, status')
        .in('id', userIds)
      
      exhibitors = exhibitors.map(ex => {
        const profile = profiles?.find(p => p.id === ex.user_id)
        return { ...ex, profiles: profile ?? null }
      })
    }
  }

  return <ExhibitorsAdminClient exhibitors={exhibitors as any} />
}
