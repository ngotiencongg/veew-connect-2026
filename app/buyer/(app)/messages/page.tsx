import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateShort, formatTime, statusColor, statusLabel } from '@/lib/utils'

export default async function BuyerMessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/buyer/login')

  // Get proposals directed to this buyer
  const { data: proposals } = await supabase
    .from('proposals')
    .select('id, message, status, created_at, exhibitors(name, category, emoji, booth)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  // Get proposals by this buyer (sent to admin)
  const { data: sentProposals } = await supabase
    .from('proposals')
    .select('id, message, status, created_at, exhibitors(name, category, emoji)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="page-wrap">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Tin nhắn & Đề xuất</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Các đề xuất gặp gỡ từ exhibitors và yêu cầu của bạn gửi lên Ban Tổ Chức
        </p>
      </div>

      {/* Proposals from Exhibitors */}
      <div className="mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <span>📬 Đề xuất từ Exhibitors</span>
          {proposals && proposals.length > 0 && (
            <span className="badge text-xs px-2 py-0.5" style={{ background: 'rgba(123,47,190,.15)', color: 'var(--purple)', borderColor: 'rgba(123,47,190,.3)' }}>
              {proposals.length}
            </span>
          )}
        </h2>
        <div className="grid gap-3">
          {proposals && proposals.length > 0 ? proposals.map((p: any) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="text-2xl flex-none">
                  {p.exhibitors?.emoji ?? '🏢'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-0.5">
                    {p.exhibitors?.name ?? 'Exhibitor'}
                  </div>
                  <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
                    {p.exhibitors?.category}{p.exhibitors?.booth ? ` · Gian ${p.exhibitors.booth}` : ''}
                  </div>
                  <p className="text-sm italic" style={{ color: 'var(--muted)' }}>
                    &ldquo;{p.message}&rdquo;
                  </p>
                </div>
                <span className={`badge text-xs flex-none ${statusColor(p.status)}`}>
                  {p.status === 'pending' ? '⏳ Đang xử lý' : p.status === 'arranged' ? '✓ Đã sắp xếp' : 'Đã từ chối'}
                </span>
              </div>
            </div>
          )) : (
            <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>
              Chưa có đề xuất nào từ exhibitors.
            </div>
          )}
        </div>
      </div>

      {/* Proposals sent by buyer */}
      <div>
        <h2 className="font-semibold mb-3">📤 Đề xuất tôi đã gửi</h2>
        <div className="grid gap-3">
          {sentProposals && sentProposals.length > 0 ? sentProposals.map((p: any) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="text-2xl flex-none">{p.exhibitors?.emoji ?? '🏢'}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{p.exhibitors?.name ?? 'Exhibitor'}</div>
                  <p className="text-sm italic" style={{ color: 'var(--muted)' }}>
                    &ldquo;{p.message}&rdquo;
                  </p>
                </div>
                <span className={`badge text-xs flex-none ${statusColor(p.status)}`}>
                  {p.status === 'pending' ? '⏳ Chờ Ban Tổ Chức' : p.status === 'arranged' ? '✓ Đã sắp xếp' : 'Từ chối'}
                </span>
              </div>
            </div>
          )) : (
            <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>
              Bạn chưa gửi đề xuất nào. Vào <strong>Tìm kiếm</strong> để đề xuất gặp gỡ với exhibitor.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
