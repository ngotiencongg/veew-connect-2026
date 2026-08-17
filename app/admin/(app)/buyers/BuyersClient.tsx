'use client'
import { useState, useTransition } from 'react'
import { approveBuyer, rejectBuyer } from '@/app/actions/buyer'
import { adminResetPassword } from '@/app/actions/admin'
import { statusColor, statusLabel } from '@/lib/utils'

type Buyer = {
  id: string
  email: string
  full_name: string
  company: string | null
  position: string | null
  industry: string | null
  country: string | null
  phone: string | null
  status: string
  created_at: string
}

export default function BuyersClient({ buyers, stats }: { buyers: Buyer[]; stats: Record<string, number> }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = buyers.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter
    const q = search.toLowerCase()
    const matchSearch = !search ||
      b.full_name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.company ?? '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  function doApprove(id: string, name: string) {
    if (!confirm(`Phê duyệt ${name}? Thông tin đăng nhập sẽ được gửi qua email.`)) return
    startTransition(async () => {
      const result = await approveBuyer(id)
      setFeedback(result.error ? { type: 'error', msg: result.error } : { type: 'success', msg: `Đã phê duyệt ${name}.` })
    })
  }

  function doReject(id: string, name: string) {
    if (!confirm(`Từ chối đăng ký của ${name}?`)) return
    startTransition(async () => {
      const result = await rejectBuyer(id)
      setFeedback(result.error ? { type: 'error', msg: result.error } : { type: 'success', msg: `Đã từ chối ${name}.` })
    })
  }

  function doReset(id: string, name: string) {
    if (!confirm(`Đặt lại mật khẩu mới cho ${name}?`)) return
    startTransition(async () => {
      const result = await adminResetPassword(id)
      if (result.error) setFeedback({ type: 'error', msg: result.error })
      else setFeedback({ type: 'success', msg: `Mật khẩu mới đã được gửi cho ${name}.` })
    })
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tổng cộng', value: stats.total, color: 'var(--text)' },
          { label: 'Chờ duyệt', value: stats.pending, color: 'var(--orange)' },
          { label: 'Đã duyệt', value: stats.approved, color: 'var(--green)' },
          { label: 'Từ chối', value: stats.rejected, color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Tìm buyer..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="tab-bar flex-none">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} className={`tab-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : f === 'approved' ? 'Đã duyệt' : 'Từ chối'}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map(b => (
          <div key={b.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold">{b.full_name}</span>
                  <span className={`badge text-xs px-2 py-0.5 ${statusColor(b.status)}`}>{statusLabel(b.status)}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{b.email}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {b.company}{b.position ? ` · ${b.position}` : ''}
                  {b.industry ? ` · ${b.industry}` : ''}
                  {b.country ? ` · ${b.country}` : ''}
                  {b.phone ? ` · ${b.phone}` : ''}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => doApprove(b.id, b.full_name)} disabled={isPending}
                      className="btn-grad text-xs px-3 py-1.5"
                      style={{ background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' }}>
                      Phê duyệt
                    </button>
                    <button onClick={() => doReject(b.id, b.full_name)} disabled={isPending}
                      className="btn-outline text-xs px-3 py-1.5 text-red-400 border-red-900 hover:border-red-500">
                      Từ chối
                    </button>
                  </>
                )}
                {b.status === 'approved' && (
                  <button onClick={() => doReset(b.id, b.full_name)} disabled={isPending}
                    className="btn-outline text-xs px-3 py-1.5">
                    Reset mật khẩu
                  </button>
                )}
                {b.status === 'rejected' && (
                  <button onClick={() => doApprove(b.id, b.full_name)} disabled={isPending}
                    className="btn-outline text-xs px-3 py-1.5">
                    Phê duyệt lại
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>Không tìm thấy buyer nào.</div>
        )}
      </div>
    </div>
  )
}
