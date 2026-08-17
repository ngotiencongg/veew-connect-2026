'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BuyerLoginPage() {
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

    // Check role + status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'buyer') { setError('Tài khoản này không phải Buyer'); setLoading(false); return }
    if (profile?.status === 'pending') { router.push('/buyer/pending'); return }
    if (profile?.status === 'rejected') { setError('Đăng ký của bạn đã bị từ chối. Vui lòng liên hệ Ban Tổ Chức.'); setLoading(false); return }

    router.push('/buyer/browse')
    router.refresh()
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(123,47,190,.15) 0%, transparent 50%), var(--dark)' }}
    >
      <div className="card p-10 w-full max-w-md">
        <Link href="/" className="text-xs mb-6 block" style={{ color: 'var(--muted)' }}>← Quay lại</Link>
        <h2 className="text-2xl font-bold mb-1">Đăng nhập Buyer</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Dành cho Hosted Buyers đã được phê duyệt</p>

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
          <button type="submit" disabled={loading} className="btn-grad w-full mt-2">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Chưa có tài khoản?{' '}
          <Link href="/buyer/register" className="text-purple-400 hover:underline">Đăng ký tại đây</Link>
        </p>
      </div>
    </main>
  )
}
