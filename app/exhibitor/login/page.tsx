'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ExhibitorLoginPage() {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'exhibitor') { setError('Tài khoản này không phải Exhibitor/Speaker'); setLoading(false); return }

    router.push('/exhibitor/slots')
    router.refresh()
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(233,30,140,.12) 0%, transparent 50%), var(--dark)' }}
    >
      <div className="card p-10 w-full max-w-md">
        <Link href="/" className="text-xs mb-6 block" style={{ color: 'var(--muted)' }}>← Quay lại</Link>
        <h2 className="text-2xl font-bold mb-1">Đăng nhập Exhibitor / Speaker</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Tài khoản được cấp bởi Ban Tổ Chức VEEW 2026</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
            <input className="input" type="email" placeholder="email@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mật khẩu</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-grad w-full mt-2"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
          Chưa có tài khoản? Liên hệ Ban Tổ Chức để được cấp tài khoản.
        </p>
      </div>
    </main>
  )
}
