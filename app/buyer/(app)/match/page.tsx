import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BuyerMatchPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/buyer/login')

  // Get buyer profile with needs
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, industry, needs')
    .eq('id', user.id)
    .single()

  // Get all exhibitors with open slots
  const { data: exhibitors } = await supabase
    .from('exhibitors')
    .select('id, name, category, description, booth, emoji')
    .order('name')

  // Score each exhibitor based on buyer needs
  const needsText = ((profile?.needs ?? '') + ' ' + (profile?.industry ?? '')).toLowerCase()
  const needsWords = needsText.split(/\s+/).filter((w: string) => w.length > 3)

  function calcScore(ex: { name: string; category: string; description: string | null }): number {
    const exText = ((ex.category ?? '') + ' ' + (ex.description ?? '') + ' ' + ex.name).toLowerCase()
    const exWords = exText.split(/\s+/).filter((w: string) => w.length > 3)
    if (needsWords.length === 0) return 50
    let matches = 0
    for (const w of needsWords) {
      if (exWords.some((ew: string) => ew.includes(w) || w.includes(ew))) matches++
    }
    return Math.min(99, Math.max(10, Math.round((matches / needsWords.length) * 100)))
  }

  const scored = (exhibitors ?? [])
    .map(ex => ({ ...ex, score: calcScore(ex) }))
    .filter(ex => ex.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return (
    <div className="page-wrap">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Gợi ý phù hợp</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Dựa trên nhu cầu của bạn, hệ thống gợi ý các exhibitor phù hợp nhất
        </p>
      </div>

      {!profile?.needs && (
        <div className="card p-6 mb-5" style={{ borderColor: 'rgba(255,109,0,.3)', background: 'rgba(255,109,0,.05)' }}>
          <p className="text-sm" style={{ color: 'var(--orange)' }}>
            💡 Để nhận gợi ý tốt hơn, hãy cập nhật <strong>nhu cầu tìm kiếm</strong> trong{' '}
            <Link href="/buyer/settings" className="underline">Cài đặt tài khoản</Link>.
          </p>
        </div>
      )}

      {profile?.needs && (
        <div className="card p-4 mb-5">
          <p className="text-xs uppercase tracking-wide mb-1 font-semibold" style={{ color: 'var(--muted)' }}>
            Nhu cầu của bạn
          </p>
          <p className="text-sm italic" style={{ color: 'var(--cyan)' }}>&ldquo;{profile.needs}&rdquo;</p>
        </div>
      )}

      <div className="grid gap-3">
        {scored.map(ex => (
          <div key={ex.id} className="card p-4">
            <div className="flex gap-4 items-start flex-wrap">
              {/* Score */}
              <div
                className="flex-none w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold"
                style={{
                  background: ex.score >= 80
                    ? 'linear-gradient(135deg,#7B2FBE,#E91E8C)'
                    : 'linear-gradient(135deg,#00BCD4,#7B2FBE)',
                }}
              >
                <span className="text-lg leading-none">{ex.score}</span>
                <span className="text-xs opacity-70">%</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="font-semibold mb-0.5">{ex.emoji} {ex.name}</div>
                <div className="text-xs mb-1" style={{ color: 'var(--cyan)' }}>
                  {ex.category}{ex.booth ? ` · Gian ${ex.booth}` : ''}
                </div>
                {ex.description && (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{ex.description}</p>
                )}
              </div>

              {/* Action */}
              <Link
                href="/buyer/browse"
                className="btn-grad text-sm px-4 py-2 flex-none"
              >
                Xem & đặt lịch →
              </Link>
            </div>
          </div>
        ))}

        {scored.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="mb-4" style={{ color: 'var(--muted)' }}>
              Chưa có gợi ý nào. Hãy cập nhật nhu cầu của bạn để nhận gợi ý phù hợp.
            </p>
            <Link href="/buyer/settings" className="btn-grad">
              Cập nhật nhu cầu →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
