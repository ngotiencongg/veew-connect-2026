'use client'
import { useState, useTransition } from 'react'
import { formatDate, formatTime, statusColor, statusLabel } from '@/lib/utils'
import { adminCancelMeeting } from '@/app/actions/meetings'
import { EVENT_DATES } from '@/types'

type Meeting = {
  id: string
  date: string
  start_time: string
  venue: string | null
  status: string
  notes: string | null
  profiles: { full_name: string; company: string | null } | null
  exhibitors: { company_name: string; booth_number: string | null } | null
}

export default function MeetingsAdminClient({ meetings, stats }: { meetings: Meeting[]; stats: Record<string, number> }) {
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = meetings.filter(m => {
    const matchDate = !filterDate || m.date === filterDate
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !search ||
      (m.profiles?.full_name ?? '').toLowerCase().includes(q) ||
      (m.exhibitors?.company_name ?? '').toLowerCase().includes(q)
    return matchDate && matchStatus && matchSearch
  })

  function doCancel(id: string) {
    if (!confirm('Hủy lịch này?')) return
    startTransition(async () => {
      const result = await adminCancelMeeting(id)
      setFeedback(result.error ? { type: 'error', msg: result.error } : { type: 'success', msg: 'Đã hủy lịch.' })
    })
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Tổng số', value: stats.total, color: 'var(--text)' },
          { label: 'Xác nhận', value: stats.confirmed, color: 'var(--green)' },
          { label: 'Đã hủy', value: stats.cancelled, color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Tìm buyer, exhibitor..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-44" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
          <option value="">Tất cả ngày</option>
          {EVENT_DATES.map(d => <option key={d.date} value={d.date}>{d.label}</option>)}
        </select>
        <div className="tab-bar flex-none">
          {(['all', 'confirmed', 'cancelled'] as const).map(f => (
            <button key={f} className={`tab-item ${filterStatus === f ? 'active' : ''}`}
              style={filterStatus === f ? { background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' } : {}}
              onClick={() => setFilterStatus(f)}>
              {f === 'all' ? 'Tất cả' : f === 'confirmed' ? 'Xác nhận' : 'Đã hủy'}
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
        {filtered.map(m => (
          <div key={m.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold">{m.profiles?.full_name}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>↔</span>
                  <span className="font-semibold">{m.exhibitors?.company_name}</span>
                  <span className={`badge text-xs px-2 py-0.5 ${statusColor(m.status)}`}>{statusLabel(m.status)}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {m.profiles?.company}{m.exhibitors?.booth_number ? ` · Booth ${m.exhibitors.booth_number}` : ''}
                </p>
                <p className="text-sm mt-1">
                  📅 {formatDate(m.date)} · ⏰ {formatTime(m.start_time)}
                  {m.venue && ` · 📍 ${m.venue}`}
                </p>
              </div>
              {m.status === 'confirmed' && (
                <button onClick={() => doCancel(m.id)} disabled={isPending}
                  className="btn-outline text-xs px-3 py-1.5 text-red-400 border-red-900 hover:border-red-500">
                  Hủy lịch
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>Không có lịch nào.</div>}
      </div>
    </div>
  )
}
