'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { statusColor } from '@/lib/utils'

type Buyer = {
  id: string
  full_name: string
  company: string | null
  industry: string | null
  needs: string | null
  country: string | null
}

type Exhibitor = {
  id: string
  name: string
  category: string
  description: string | null
  booth: string | null
  emoji: string | null
}

type ExistingMeeting = { buyer_id: string; exhibitor_id: string }

// Simple keyword-based scoring
function calcScore(buyer: Buyer, ex: Exhibitor): number {
  const needsText = ((buyer.needs ?? '') + ' ' + (buyer.industry ?? '')).toLowerCase()
  const exText = ((ex.category ?? '') + ' ' + (ex.description ?? '') + ' ' + ex.name).toLowerCase()

  const needsWords = needsText.split(/\s+/).filter(w => w.length > 3)
  const exWords = exText.split(/\s+/).filter(w => w.length > 3)

  let matches = 0
  for (const w of needsWords) {
    if (exWords.some(ew => ew.includes(w) || w.includes(ew))) matches++
  }

  const baseScore = needsWords.length > 0 ? Math.round((matches / needsWords.length) * 100) : 0
  return Math.min(99, Math.max(10, baseScore))
}

export default function AdminMatchingClient({
  buyers,
  exhibitors,
  existingMeetings,
}: {
  buyers: Buyer[]
  exhibitors: Exhibitor[]
  existingMeetings: ExistingMeeting[]
}) {
  const router = useRouter()
  const [selectedBuyer, setSelectedBuyer] = useState<string>('all')
  const [minScore, setMinScore] = useState(60)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Build matches
  const matchedPairs = existingMeetings.map(m => `${m.buyer_id}__${m.exhibitor_id}`)

  const matches: Array<{ buyer: Buyer; ex: Exhibitor; score: number; alreadyMatched: boolean }> = []
  for (const buyer of buyers) {
    if (selectedBuyer !== 'all' && buyer.id !== selectedBuyer) continue
    for (const ex of exhibitors) {
      const score = calcScore(buyer, ex)
      if (score >= minScore) {
        matches.push({
          buyer,
          ex,
          score,
          alreadyMatched: matchedPairs.includes(`${buyer.id}__${ex.id}`),
        })
      }
    }
  }
  matches.sort((a, b) => b.score - a.score)

  function doArrange(buyerId: string, exId: string, buyerName: string, exName: string) {
    if (!confirm(`Sắp xếp cuộc gặp:\n${buyerName} ↔ ${exName}`)) return
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/arrange-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buyerId, exhibitorId: exId }),
        })
        if (res.ok) {
          setFeedback(`✅ Đã sắp xếp lịch hẹn: ${buyerName} ↔ ${exName}`)
          router.refresh()
        }
        else setFeedback('❌ Có lỗi xảy ra, vui lòng thử lại.')
      } catch {
        setFeedback('❌ Lỗi kết nối. Vui lòng thử lại.')
      }
      setTimeout(() => setFeedback(null), 4000)
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Smart Matching</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Gợi ý kết nối giữa Buyers và Exhibitors dựa trên nhu cầu và danh mục dịch vụ
        </p>
      </div>

      {/* Controls */}
      <div className="card p-4 mb-5 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Lọc theo Buyer</label>
          <select
            className="input w-56 text-sm"
            value={selectedBuyer}
            onChange={e => setSelectedBuyer(e.target.value)}
          >
            <option value="all">— Tất cả Buyers —</option>
            {buyers.map(b => (
              <option key={b.id} value={b.id}>{b.full_name} ({b.company})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>
            Điểm tối thiểu: <strong style={{ color: 'var(--cyan)' }}>{minScore}%</strong>
          </label>
          <input
            type="range" min={10} max={90} step={5}
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="w-48 accent-purple-500"
          />
        </div>
        <div className="ml-auto text-sm" style={{ color: 'var(--muted)' }}>
          {matches.length} gợi ý phù hợp
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg mb-4 text-sm bg-green-900/30 text-green-300">
          {feedback}
        </div>
      )}

      {/* Match cards */}
      <div className="grid gap-3">
        {matches.map(({ buyer, ex, score, alreadyMatched }) => (
          <div key={`${buyer.id}-${ex.id}`} className="card p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Score badge */}
              <div
                className="flex-none w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold"
                style={{ background: score >= 80 ? 'linear-gradient(135deg,#7B2FBE,#E91E8C)' : score >= 60 ? 'linear-gradient(135deg,#00BCD4,#7B2FBE)' : '#2E2E50' }}
              >
                <span className="text-lg leading-none">{score}</span>
                <span className="text-xs opacity-70">%</span>
              </div>

              {/* Buyer */}
              <div className="flex-1 min-w-40">
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--muted)' }}>Buyer</div>
                <div className="font-semibold text-sm">{buyer.full_name}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{buyer.company} · {buyer.industry}</div>
                {buyer.needs && (
                  <div className="text-xs mt-1 italic" style={{ color: 'var(--cyan)' }}>
                    &ldquo;{buyer.needs.slice(0, 80)}{buyer.needs.length > 80 ? '…' : ''}&rdquo;
                  </div>
                )}
              </div>

              <div className="flex-none text-2xl" style={{ color: 'var(--muted)' }}>↔</div>

              {/* Exhibitor */}
              <div className="flex-1 min-w-40">
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--muted)' }}>Exhibitor</div>
                <div className="font-semibold text-sm">{ex.emoji} {ex.name}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{ex.category}{ex.booth ? ` · ${ex.booth}` : ''}</div>
                {ex.description && (
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {ex.description.slice(0, 60)}{ex.description.length > 60 ? '…' : ''}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex-none">
                {alreadyMatched ? (
                  <span className="badge" style={{ background: 'rgba(0,200,83,.15)', color: 'var(--green)', borderColor: 'rgba(0,200,83,.3)' }}>
                    ✓ Đã sắp xếp
                  </span>
                ) : (
                  <button
                    className="btn-grad text-sm px-4 py-2"
                    disabled={isPending}
                    onClick={() => doArrange(buyer.id, ex.id, buyer.full_name, ex.name)}
                  >
                    Sắp xếp gặp
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p style={{ color: 'var(--muted)' }}>
              Không có gợi ý phù hợp. Hãy thử giảm điểm tối thiểu hoặc đảm bảo Buyers đã điền nhu cầu.
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 card p-4">
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Thuật toán matching</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Điểm phù hợp được tính dựa trên từ khóa trong nhu cầu (needs) của Buyer so với danh mục dịch vụ và mô tả của Exhibitor. 
          Điểm ≥80% (tím-hồng): rất phù hợp. Điểm 60–79% (xanh-tím): khá phù hợp.
        </p>
      </div>
    </div>
  )
}
