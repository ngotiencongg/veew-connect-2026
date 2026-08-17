'use client'
import { useState, useTransition } from 'react'
import { adminResetPassword } from '@/app/actions/admin'
import Link from 'next/link'

type Exhibitor = {
  id: string
  company_name: string
  category: string
  booth_number: string | null
  description: string | null
  website: string | null
  profiles: { id: string; full_name: string; email: string; phone: string | null; country: string | null; status: string }
}

export default function ExhibitorsAdminClient({ exhibitors }: { exhibitors: Exhibitor[] }) {
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = exhibitors.filter(ex => {
    const q = search.toLowerCase()
    return !search || ex.company_name.toLowerCase().includes(q) || ex.profiles.email.toLowerCase().includes(q)
  })

  function doReset(profileId: string, name: string) {
    if (!confirm(`Đặt lại mật khẩu mới cho ${name}?`)) return
    startTransition(async () => {
      const result = await adminResetPassword(profileId)
      if (result.error) setFeedback({ type: 'error', msg: result.error })
      else setFeedback({ type: 'success', msg: `Mật khẩu mới đã được gửi cho ${name}.` })
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Exhibitors & Speakers</h1>
        <Link href="/admin/create-exhibitor" className="btn-grad text-sm"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' }}>
          + Tạo tài khoản
        </Link>
      </div>

      <input className="input max-w-sm mb-4" placeholder="Tìm exhibitor..." value={search} onChange={e => setSearch(e.target.value)} />

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map(ex => (
          <div key={ex.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold">{ex.company_name}</span>
                  <span className="badge text-xs px-2 py-0.5"
                    style={{ background: 'rgba(233,30,140,.1)', borderColor: 'rgba(233,30,140,.3)', color: '#E91E8C' }}>
                    {ex.category}
                  </span>
                  {ex.booth_number && <span className="text-xs" style={{ color: 'var(--muted)' }}>Booth {ex.booth_number}</span>}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {ex.profiles.full_name} · {ex.profiles.email}
                  {ex.profiles.phone ? ` · ${ex.profiles.phone}` : ''}
                </p>
                {ex.description && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{ex.description}</p>}
              </div>
              <button onClick={() => doReset(ex.profiles.id, ex.profiles.full_name)} disabled={isPending}
                className="btn-outline text-xs px-3 py-1.5">
                Reset mật khẩu
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>Không tìm thấy exhibitor nào.</div>}
      </div>
    </div>
  )
}
