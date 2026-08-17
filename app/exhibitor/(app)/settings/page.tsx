import { createClient } from '@/lib/supabase/server'
import ExhibitorSettingsClient from './ExhibitorSettingsClient'

export default async function ExhibitorSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, company, phone, country')
    .eq('id', user!.id)
    .single()

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('company_name, category, booth_number, description, website')
    .eq('profile_id', user!.id)
    .single()

  return <ExhibitorSettingsClient profile={profile} exhibitor={exhibitor} />
}
