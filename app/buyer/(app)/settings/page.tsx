import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function BuyerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()
  const profile = rawProfile ? { ...rawProfile, email: user?.email ?? '' } : null

  return <SettingsClient profile={profile} />
}
