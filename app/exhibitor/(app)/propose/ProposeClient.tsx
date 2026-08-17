'use client'
import { useState, useTransition } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { proposeMeeting } from '@/app/actions/meetings'

type Buyer = { id: string; full_name: string; company: string | null; position: string | null; industry: string | null; country: string | null }
type Slot = { id: string; date: string; start_time: string; end_time: string; venue: string | null }

export default function ProposeClient({
  buyers, slots, proposedBuyerIds,
}: {
  buyers: Buyer[]
  slots: Slot[]
  proposedBuyerIds: string[]
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ buyer: Buyer; slot: Slot } | null>(null)
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const proposed = new Set(proposedBuyerIds)

  const filtered = buyers.filter(b => {
    const q = search.toLowerCase()
    return !search || b.full_name.toLowerCase().includes(q) || (b.company ?? '').toLowerCase().includes(q)
  })

  function handlePropose() {
    if (!selected) return
    startTransition(async () => {
      const result = await proposeMeeting(selected.buyer.id, selected.slot.id, message || undefined)
      if (result.error) {
        setFeedback({ type: 'error', msg: result.error })
      } else {
        setFeedback({ type: 'success', msg: `Đã gửi đề xuất đến ${selected.buyer.full_name}.` })
        setSelected(null)
        setMessage('')
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Đề xuất gặp Buyer</h1>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>{filtered.length} buyers</span>
      </div>

      {slots.length === 0 && (
        <div className="card p-4 mb-4 text-sm" style={{ borderColor: 'rgba(255,109,0,.4)', background: 'rgba(255,109,0,.05)' }}>
          ⚠️ Bạn chưa có slot trống. Vui lòng tạo slot trong mục "Quản lý slot" trước khi đề xuất gặp.
        </div>
      )}

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      <input className="input mb-4 max-w-sm" placeholder="Tìm buyer..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="grid gap-3">
        {filtered.map(buyer => (
          <div key={buyer.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{buyer.full_name}</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {buyer.company}{buyer.position ? ` · ${buyer.position}` : ''}
                  {buyer.industry ? ` · ${buyer.industry}` : ''}
                  {buyer.country ? ` · ${buyer.country}` : ''}
                </p>
              </div>
              {proposed.has(buyer.id) ? (
                <span className="badge text-xs px-2 py-0.5"
                  style={{ background: 'rgba(0,188,212,.1)', borderColor: 'rgba(0,188,212,.3)', color: 'var(--cyan)' }}>
                  Đã đề xuất
                </span>
              ) : (
                <button
                  onClick={() => setSelected({ buyer, slot: slots[0] })}
                  disabled={slots.length === 0}
                  className="btn-grad text-xs px-3 py-1.5"
                  style={{ background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' }}
                >
                  Đề xuất gặp
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Đề xuất gặp {selected.buyer.full_name}</h3>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Chọn slot</label>
              <select className="input" onChange={e => {
                const slot = slots.find(s => s.id === e.target.value)
                if (slot) setSelected({ ...selected, slot })
              }}>
                {slots.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.date)} {formatTime(s.start_time)}–{formatTime(s.end_time)}
                    {s.venue ? ` · ${s.venue}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Lời nhắn (tuỳ chọn)</label>
              <textarea className="input min-h-[70px] resize-none" value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Giới thiệu ngắn về lý do muốn gặp..." />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-outline flex-1" disabled={isPending}>Huỷ</button>
              <button onClick={handlePropose} className="btn-grad flex-1" disabled={isPending}
                style={{ background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' }}>
                {isPending ? 'Đang gửi...' : 'Gửi đề xuất'}
              </button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && <p className="text-center py-8" style={{ color: 'var(--muted)' }}>Không tìm thấy buyer nào.</p>}
    </div>
  )
}
