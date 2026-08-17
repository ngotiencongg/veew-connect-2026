'use client'
import { useState, useTransition } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { createSlot, deleteSlot } from '@/app/actions/exhibitor'
import { EVENT_DATES, VENUE_OPTIONS } from '@/types'

type Slot = {
  id: string
  date: string
  start_time: string
  end_time: string
  venue: string | null
  notes: string | null
  is_booked: boolean
  meetings?: Array<{
    buyer_id: string
    status: string
    profiles: { full_name: string; company: string } | null
  }>
}

export default function SlotsClient({ slots, exhibitorId }: { slots: Slot[]; exhibitorId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(EVENT_DATES[0].date)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [venue, setVenue] = useState('')
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('date', date)
    fd.append('startTime', startTime)
    fd.append('endTime', endTime)
    fd.append('venue', venue)
    fd.append('notes', notes)

    startTransition(async () => {
      const result = await createSlot(fd)
      if (result.error) {
        setFeedback({ type: 'error', msg: result.error })
      } else {
        setFeedback({ type: 'success', msg: 'Tạo slot thành công!' })
        setShowForm(false)
        setNotes('')
      }
    })
  }

  function handleDelete(slotId: string) {
    if (!confirm('Xóa slot này?')) return
    startTransition(async () => {
      const result = await deleteSlot(slotId)
      if (result.error) setFeedback({ type: 'error', msg: result.error })
      else setFeedback({ type: 'success', msg: 'Đã xóa slot.' })
    })
  }

  // Quick-add presets
  const quickSlots = [
    { label: 'Sáng 30p', start: '09:00', end: '09:30' },
    { label: 'Sáng 1h', start: '09:00', end: '10:00' },
    { label: 'Chiều 30p', start: '13:30', end: '14:00' },
    { label: 'Chiều 1h', start: '13:30', end: '14:30' },
    { label: '10:00–10:30', start: '10:00', end: '10:30' },
    { label: '15:00–15:30', start: '15:00', end: '15:30' },
  ]

  const grouped = EVENT_DATES.reduce<Record<string, Slot[]>>((acc, d) => {
    acc[d.date] = slots.filter(s => s.date === d.date)
    return acc
  }, {})
  // Include any custom dates outside EVENT_DATES
  slots.forEach(s => {
    if (!EVENT_DATES.some(d => d.date === s.date) && !grouped[s.date]) {
      grouped[s.date] = []
    }
    if (!EVENT_DATES.some(d => d.date === s.date)) {
      grouped[s.date].push(s)
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Quản lý slot gặp gỡ</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-grad text-sm">
          {showForm ? 'Huỷ' : '+ Thêm slot'}
        </button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      {/* Add slot form */}
      {showForm && (
        <div className="card p-5 mb-6" style={{ borderColor: 'rgba(123,47,190,.4)' }}>
          <h3 className="font-semibold mb-4 text-sm">Tạo slot mới</h3>

          {/* Quick presets */}
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Khung giờ nhanh:</p>
            <div className="flex flex-wrap gap-2">
              {quickSlots.map(q => (
                <button key={q.label} type="button"
                  onClick={() => { setStartTime(q.start); setEndTime(q.end) }}
                  className="btn-outline text-xs px-2 py-1">
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Ngày</label>
              <select className="input" value={date} onChange={e => setDate(e.target.value)}>
                {EVENT_DATES.map(d => <option key={d.date} value={d.date}>{d.label}</option>)}
                <option value="2026-10-16">16/10/2026 (trước sự kiện)</option>
                <option value="2026-10-20">20/10/2026 (sau sự kiện)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Địa điểm</label>
              <select className="input" value={venue} onChange={e => setVenue(e.target.value)}>
                <option value="">-- Chọn phòng --</option>
                {VENUE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Bắt đầu</label>
              <input type="time" className="input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Kết thúc</label>
              <input type="time" className="input" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Ghi chú (tuỳ chọn)</label>
              <input className="input" placeholder="VD: Dành cho đối tác F&B" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isPending} className="btn-grad">
                {isPending ? 'Đang tạo...' : 'Tạo slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slot list */}
      {Object.entries(grouped).map(([d, daySlots]) => (
        daySlots.length > 0 && (
          <div key={d} className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>
              📅 {formatDate(d)} — {daySlots.length} slot
            </h3>
            <div className="grid gap-3">
              {daySlots.map(slot => {
                const activeMeeting = slot.meetings?.find(m => m.status !== 'cancelled')
                return (
                  <div key={slot.id} className="card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                          </span>
                          {slot.venue && <span className="text-xs" style={{ color: 'var(--muted)' }}>📍 {slot.venue}</span>}
                          {slot.is_booked ? (
                            <span className="badge text-xs px-2 py-0.5"
                              style={{ background: 'rgba(0,200,83,.15)', borderColor: 'rgba(0,200,83,.4)', color: 'var(--green)' }}>
                              ✓ Đã đặt
                            </span>
                          ) : (
                            <span className="badge text-xs px-2 py-0.5"
                              style={{ background: 'rgba(0,188,212,.1)', borderColor: 'rgba(0,188,212,.3)', color: 'var(--cyan)' }}>
                              Trống
                            </span>
                          )}
                        </div>
                        {activeMeeting?.profiles && (
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                            👤 {activeMeeting.profiles.full_name} — {activeMeeting.profiles.company}
                          </p>
                        )}
                        {slot.notes && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>📝 {slot.notes}</p>}
                      </div>
                      {!slot.is_booked && (
                        <button onClick={() => handleDelete(slot.id)} disabled={isPending}
                          className="btn-outline text-xs px-2 py-1 text-red-400 border-red-900 hover:border-red-500">
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      ))}

      {slots.length === 0 && !showForm && (
        <div className="card p-10 text-center" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">🗓</p>
          <p>Chưa có slot nào. Nhấn "+ Thêm slot" để bắt đầu.</p>
        </div>
      )}
    </div>
  )
}
