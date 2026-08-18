'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { generatePassword } from '@/lib/utils'
import { sendBuyerCredentials } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export type ImportBuyerRow = {
  email: string
  full_name: string
  company: string
  position?: string
  phone?: string
  industry?: string
  country?: string
}

export async function importBuyers(rows: ImportBuyerRow[]) {
  const admin = createAdminClient()
  const results: { email: string; status: 'success' | 'error'; message?: string }[] = []

  for (const row of rows) {
    if (!row.email || !row.full_name || !row.company) {
      results.push({ email: row.email || '?', status: 'error', message: 'Thiếu email, họ tên, hoặc công ty' })
      continue
    }

    const password = generatePassword(10)

    const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
      email: row.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: row.full_name, role: 'buyer' },
    })

    if (signUpError) {
      results.push({ email: row.email, status: 'error', message: signUpError.message })
      continue
    }

    await admin.from('profiles').upsert({
      id: authData.user.id,
      email: row.email,
      full_name: row.full_name,
      role: 'buyer',
      status: 'approved',
      company: row.company,
      position: row.position,
      phone: row.phone,
      industry: row.industry,
      country: row.country,
    })

    await sendBuyerCredentials({ to: row.email, name: row.full_name, password })
    results.push({ email: row.email, status: 'success' })
  }

  // Log import
  await admin.from('import_logs').insert({
    source: 'csv',
    total_rows: rows.length,
    imported: results.filter(r => r.status === 'success').length,
    skipped: results.filter(r => r.status === 'error').length,
  })

  revalidatePath('/admin/buyers')
  return { results }
}

export async function adminResetPassword(userId: string) {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name:name, role')
    .eq('id', userId)
    .single()

  if (!profile) return { error: 'Không tìm thấy người dùng.' }

  const newPassword = generatePassword(10)
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) return { error: 'Lỗi đặt lại mật khẩu.' }

  if (profile.role === 'buyer') {
    const { data: userRes } = await admin.auth.admin.getUserById(userId)
    if (userRes?.user?.email) {
      await sendBuyerCredentials({ to: userRes.user.email, name: profile.full_name, password: newPassword })
    }
  }

  return { success: true, newPassword }
}

export async function deleteUser(userId: string) {
  const admin = createAdminClient()
  await admin.from('profiles').update({ status: 'rejected' }).eq('id', userId)
  revalidatePath('/admin/buyers')
  revalidatePath('/admin/exhibitors')
  return { success: true }
}
