'use client'
import { useState, useTransition } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { bookSlot } from '@/app/actions/meetings'
import { EVENT_DATES } from '@/types'

type Slot = {
  id: string
  date: string
  start_time: string
  venue: string | null
  is_open: boolean
  notes: string | null
}

type Exhibitor = {
  id: string
  company_name: string
  category: string
  booth_number: string | null
  description: string | null
  website: string | null
  profiles: { full_name: string; industry: string | null; country: string | null }
  slots: Slot[]
}

export default function BrowseClient({
  exhibitors,
  bookedExhibitorIds,
}: {
  exhibitors: Exhibitor[]
  bookedExhibitorIds: string[]
}) {
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<{ slot: Slot; exhibitor: Exhibitor } | null>(null)
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const booked = new Set(bookedExhibitorIds)

  const filtered = exhibitors.filter(ex => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      ex.company_name.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q) ||
      (ex.profiles.industry ?? '').toLowerCase().includes(q)

    const matchDate = !filterDate ||
      ex.slots.some(s => s.date === filterDate && s.is_open)

    return matchSearch && matchDate
  })

  function handleBook() {
    if (!selectedSlot) return
    startTransition(async () => {
      const result = await bookSlot(selectedSlot.slot.id, notes || undefined)
      if (result.error) {
        setFeedback({ type: 'error', message: result.error })
      } else {
        setFeedback({ type: 'success', message: 'Đặt lịch thành công! Thông tin xác nhận đã được gửi qua email.' })
        setSelectedSlot(null)
        setNotes('')
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Exhibitors & Speakers</h1>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>{filtered.length} kết quả</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="Tìm theo tên, ngành..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-44" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
          <option value="">Tất cả ngày</option>
          {EVENT_DATES.map(d => (
            <option key={d.date} value={d.date}>{d.label}</option>
          ))}
        </select>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
          {feedback.message}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      {/* Exhibitor cards */}
      <div className="grid gap-4">
        {filtered.map(ex => {
          const openSlots = ex.slots.filter(s => s.is_open)
          const alreadyBooked = booked.has(ex.id)

          return (
            <div key={ex.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-base">{ex.company_name}</h3>
                    <span className="badge text-xs px-2 py-0.5"
                      style={{ background: 'rgba(123,47,190,.2)', borderColor: 'rgba(123,47,190,.4)', color: '#C084FC' }}>
                      {ex.category}
                    </span>
                    {ex.booth_number && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Booth {ex.booth_number}</span>
                    )}
                  </div>
                  {ex.description && (
                    <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>{ex.description}</p>
                  )}
                  <div className="flex gap-3 text-xs flex-wrap" style={{ color: 'var(--muted)' }}>
                    {ex.profiles.industry && <span>🏭 {ex.profiles.industry}</span>}
                    {ex.profiles.country && <span>🌏 {ex.profiles.country}</span>}
                    {ex.website && <a href={ex.website} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">🌐 Website</a>}
                  </div>
                </div>

                <div className="sm:text-right">
                  {alreadyBooked ? (
                    <span className="badge text-xs px-3 py-1"
                      style={{ background: 'rgba(0,200,83,.15)', borderColor: 'rgba(0,200,83,.4)', color: 'var(--green)' }}>
                      ✓ Đã đặt lịch
                    </span>
                  ) : openSlots.length === 0 ? (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Hết slot</span>
                  ) : (
                    <span className="text-xs text-purple-400">{openSlots.length} slot trống</span>
                  )}
                </div>
              </div>

              {/* Slots */}
              {!alreadyBooked && openSlots.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Chọn khung giờ:</p>
                  <div className="flex flex-wrap gap-2">
                    {openSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot({ slot, exhibitor: ex })}
                        className="btn-outline text-xs px-3 py-1.5 hover:border-purple-500 hover:text-purple-400"
                      >
                        {formatDate(slot.date)} {formatTime(slot.start_time)}
                        {slot.venue && <span className="ml-1 opacity-60">· {slot.venue}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
            Không tìm thấy exhibitor nào phù hợp
          </div>
        )}
      </div>

      {/* Booking modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedSlot(null) }}>
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-1">Xác nhận đặt lịch</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              {selectedSlot.exhibitor.company_name} —{' '}
              {formatDate(selectedSlot.slot.date)} {formatTime(selectedSlot.slot.start_time)}
              {selectedSlot.slot.venue && ` · ${selectedSlot.slot.venue}`}
            </p>

            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              Ghi chú / Chủ đề muốn thảo luận (tuỳ chọn)
            </label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Ví dụ: Muốn tìm hiểu về giải pháp X..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedSlot(null)}
                className="btn-outline flex-1"
                disabled={isPending}
              >
                Huỷ
              </button>
              <button
                onClick={handleBook}
                className="btn-grad flex-1"
                disabled={isPending}
              >
                {isPending ? 'Đang đặt...' : 'Xác nhận đặt lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
