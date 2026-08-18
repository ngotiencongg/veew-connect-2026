'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Email hoặc mật khẩu không đúng'); setLoading(false); return }

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profErr) {
      setError(`Lỗi truy vấn quyền (ID: ${data.user.id}): ` + profErr.message)
      setLoading(false)
      return
    }

    if (profile?.role !== 'admin') { 
      setError(`Tài khoản này không có quyền Admin (Quyền hiện tại: ${profile?.role})`)
      setLoading(false) 
      return 
    }

    router.push('/admin/buyers')
    router.refresh()
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(0,188,212,.12) 0%, transparent 50%), var(--dark)' }}
    >
      <div className="card p-10 w-full max-w-md">
        <Link href="/" className="text-xs mb-6 block" style={{ color: 'var(--muted)' }}>← Quay lại</Link>
        <h2 className="text-2xl font-bold mb-1">Đăng nhập Ban Tổ Chức</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Quản trị viên hệ thống VEEW 2026</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
            <input className="input" type="email" placeholder="admin@veew.vn"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mật khẩu</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-grad w-full mt-2"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  )
}
