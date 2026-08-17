import { createAdminClient } from '@/lib/supabase/server'
import ExhibitorsAdminClient from './ExhibitorsAdminClient'

export default async function AdminExhibitorsPage() {
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawExhibitors } = await admin
    .from('exhibitors')
    .select(`
      id, company_name, category, booth_number, description, website,
      profiles:profile_id(id, full_name, email, phone, country, status)
    `)
    .order('company_name')

  // Normalize profiles from array to single object (Supabase returns array for FK joins)
  const exhibitors = (rawExhibitors ?? []).map((ex: any) => ({
    ...ex,
    profiles: Array.isArray(ex.profiles) ? ex.profiles[0] ?? null : ex.profiles,
  }))

  return <ExhibitorsAdminClient exhibitors={exhibitors} />
}
