'use client'
import { useState, useTransition } from 'react'
import { formatDate, formatTime, statusColor, statusLabel } from '@/lib/utils'
import { acceptProposal, rejectProposal } from '@/app/actions/meetings'

type Proposal = {
  id: string
  status: string
  message: string | null
  created_at: string
  slots: { date: string; start_time: string; venue: string | null } | null
  exhibitors: {
    company_name: string
    booth_number: string | null
    profiles: { full_name: string }
  } | null
}

export default function ProposalsClient({ proposals }: { proposals: Proposal[] }) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handle(fn: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await fn()
      if (result.error) setFeedback({ type: 'error', msg: result.error })
      else setFeedback({ type: 'success', msg: 'Thao tác thành công.' })
    })
  }

  const pending = proposals.filter(p => p.status === 'pending')
  const others = proposals.filter(p => p.status !== 'pending')

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Đề xuất gặp gỡ</h1>

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      {proposals.length === 0 && (
        <div className="card p-10 text-center" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">📨</p>
          <p>Chưa có đề xuất nào từ Exhibitors.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Chờ phản hồi ({pending.length})
          </p>
          <div className="grid gap-4">
            {pending.map(p => (
              <div key={p.id} className="card p-5" style={{ borderColor: 'rgba(123,47,190,.4)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold mb-0.5">{p.exhibitors?.company_name}</h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {p.slots ? `📅 ${formatDate(p.slots.date)} · ⏰ ${formatTime(p.slots.start_time)}${p.slots.venue ? ` · ${p.slots.venue}` : ''}` : '—'}
                    </p>
                    {p.message && <p className="text-sm mt-2 italic">"{p.message}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handle(() => rejectProposal(p.id))}
                      disabled={isPending}
                      className="btn-outline text-xs px-3 py-1.5"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handle(() => acceptProposal(p.id))}
                      disabled={isPending}
                      className="btn-grad text-xs px-3 py-1.5"
                    >
                      Chấp nhận
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Đã xử lý
          </p>
          <div className="grid gap-3">
            {others.map(p => (
              <div key={p.id} className="card p-4 opacity-60">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{p.exhibitors?.company_name}</span>
                  <span className={`badge text-xs px-2 py-0.5 ${statusColor(p.status)}`}>{statusLabel(p.status)}</span>
                  {p.slots && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{formatDate(p.slots.date)} {formatTime(p.slots.start_time)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
