import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/lib/utils'

export default async function ExhibitorConfirmedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { data: meetings } = await supabase
    .from('meetings')
    .select(`
      id, date, start_time, end_time, venue, notes,
      profiles!buyer_id(full_name:name, company, position, phone, industry, country)
    `)
    .eq('exhibitor_id', exhibitor?.id)
    .eq('status', 'confirmed')
    .order('date')
    .order('start_time')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Lịch xác nhận</h1>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>{meetings?.length ?? 0} cuộc gặp</span>
      </div>

      {(!meetings || meetings.length === 0) && (
        <div className="card p-10 text-center" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">✅</p>
          <p>Chưa có lịch xác nhận nào.</p>
        </div>
      )}

      {/* Group by date */}
      {['2026-10-17', '2026-10-18', '2026-10-19'].map(date => {
        const dayMeetings = meetings?.filter(m => m.date === date) ?? []
        if (dayMeetings.length === 0) return null
        return (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>
              📅 {formatDate(date)} — {dayMeetings.length} cuộc gặp
            </h3>
            <div className="grid gap-3">
              {dayMeetings.map(m => {
                const buyer = m.profiles as any
                return (
                  <div key={m.id} className="card p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold" style={{ color: 'var(--cyan)' }}>{formatTime(m.start_time)}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{formatTime(m.end_time)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{buyer?.full_name}</p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          {buyer?.company}{buyer?.position ? ` · ${buyer.position}` : ''}
                        </p>
                        <div className="flex gap-4 text-xs mt-1 flex-wrap" style={{ color: 'var(--muted)' }}>
                          {buyer?.phone && <span>📞 {buyer.phone}</span>}
                          {buyer?.industry && <span>🏭 {buyer.industry}</span>}
                          {m.venue && <span>📍 {m.venue}</span>}
                        </div>
                        {m.notes && <p className="text-xs mt-1 italic">"{m.notes}"</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
