'use client'
import { useState, useTransition } from 'react'
import { formatDate, formatTime, statusColor, statusLabel } from '@/lib/utils'
import { cancelMeeting } from '@/app/actions/meetings'

type Meeting = {
  id: string
  date: string
  start_time: string
  venue: string | null
  status: string
  notes: string | null
  exhibitors: {
    company_name: string
    booth_number: string | null
    profiles: { full_name: string }
  } | null
}

export default function ScheduleClient({ meetings }: { meetings: Meeting[] }) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel(id: string) {
    if (!confirm('Bạn có chắc muốn hủy lịch này?')) return
    startTransition(async () => {
      const result = await cancelMeeting(id)
      if (result.error) setFeedback(result.error)
      else setFeedback('Đã hủy lịch.')
    })
  }

  const active = meetings.filter(m => m.status !== 'cancelled')
  const cancelled = meetings.filter(m => m.status === 'cancelled')

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Lịch của tôi</h1>

      {feedback && (
        <div className="p-3 rounded-lg mb-4 text-sm bg-blue-900/30 text-blue-300">
          {feedback}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      {active.length === 0 && (
        <div className="card p-10 text-center" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">📅</p>
          <p>Bạn chưa có lịch gặp nào. Hãy khám phá các exhibitors và đặt lịch!</p>
        </div>
      )}

      <div className="grid gap-4">
        {active.map(m => (
          <div key={m.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold">{m.exhibitors?.company_name ?? '—'}</h3>
                  <span className={`badge text-xs px-2 py-0.5 ${statusColor(m.status)}`}>
                    {statusLabel(m.status)}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {m.exhibitors?.profiles?.full_name && `Người phụ trách: ${m.exhibitors.profiles.full_name}`}
                  {m.exhibitors?.booth_number && ` · Booth ${m.exhibitors.booth_number}`}
                </p>
                <p className="text-sm mt-1">
                  📅 {formatDate(m.date)} · ⏰ {formatTime(m.start_time)}
                  {m.venue && ` · 📍 ${m.venue}`}
                </p>
                {m.notes && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>📝 {m.notes}</p>}
              </div>

              {m.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(m.id)}
                  disabled={isPending}
                  className="btn-outline text-xs px-3 py-1.5 text-red-400 border-red-900 hover:border-red-500"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        ))}

        {cancelled.length > 0 && (
          <details className="mt-2">
            <summary className="text-sm cursor-pointer" style={{ color: 'var(--muted)' }}>
              Lịch đã hủy ({cancelled.length})
            </summary>
            <div className="grid gap-3 mt-3">
              {cancelled.map(m => (
                <div key={m.id} className="card p-4 opacity-50">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{m.exhibitors?.company_name}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {formatDate(m.date)} {formatTime(m.start_time)}
                    </span>
                    <span className="badge text-xs px-2 py-0.5" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      Đã hủy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
