import { createClient } from '@/lib/supabase/server'

export default async function ExhibitorRequestsPage() {
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
      id, date, start_time, end_time, venue, status, notes, created_at,
      profiles!buyer_id(full_name:name, company, position, industry, country, phone)
    `)
    .eq('exhibitor_id', exhibitor?.id)
    .neq('status', 'cancelled')
    .order('date')
    .order('start_time')

  const { formatDate, formatTime, statusColor, statusLabel } = await import('@/lib/utils')

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Yêu cầu gặp từ Buyers</h1>

      {(!meetings || meetings.length === 0) && (
        <div className="card p-10 text-center" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">📬</p>
          <p>Chưa có yêu cầu gặp nào từ Buyers.</p>
        </div>
      )}

      <div className="grid gap-4">
        {meetings?.map(m => {
          const buyer = m.profiles as any
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold">{buyer?.full_name}</h3>
                    <span className={`badge text-xs px-2 py-0.5 ${statusColor(m.status)}`}>
                      {statusLabel(m.status)}
                    </span>
                  </div>
                  <div className="text-sm space-y-0.5" style={{ color: 'var(--muted)' }}>
                    {buyer?.company && <p>🏢 {buyer.company}{buyer?.position ? ` · ${buyer.position}` : ''}</p>}
                    {buyer?.industry && <p>🏭 {buyer.industry}</p>}
                    {buyer?.country && <p>🌏 {buyer.country}</p>}
                    {buyer?.phone && <p>📞 {buyer.phone}</p>}
                  </div>
                  <p className="text-sm mt-2">
                    📅 {formatDate(m.date)} · ⏰ {formatTime(m.start_time)}–{formatTime(m.end_time)}
                    {m.venue && ` · 📍 ${m.venue}`}
                  </p>
                  {m.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--muted)' }}>"{m.notes}"</p>}
                </div>
                {m.status === 'pending' && (
                  <div className="flex gap-2">
                    <form action={async () => {
                      'use server'
                      const { acceptMeeting } = await import('@/app/actions/meetings')
                      await acceptMeeting(m.id)
                    }}>
                      <button className="btn-grad text-xs px-3 py-1.5" style={{ background: 'var(--green)' }}>Chấp nhận</button>
                    </form>
                    <form action={async () => {
                      'use server'
                      const { rejectMeeting } = await import('@/app/actions/meetings')
                      await rejectMeeting(m.id)
                    }}>
                      <button className="btn-outline text-xs px-3 py-1.5 text-red-400 border-red-900 hover:border-red-500">Từ chối</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
