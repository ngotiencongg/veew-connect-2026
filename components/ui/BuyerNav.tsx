'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/buyer/browse', label: 'Khám phá' },
  { href: '/buyer/match', label: '✨ Gợi ý' },
  { href: '/buyer/schedule', label: 'Lịch hẹn' },
  { href: '/buyer/messages', label: 'Tin nhắn' },
  { href: '/buyer/proposals', label: 'Đề xuất' },
  { href: '/buyer/settings', label: 'Cài đặt' },
]

export default function BuyerNav() {
  const path = usePathname()
  return (
    <div style={{ background: 'var(--dark2)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="tab-bar rounded-none bg-transparent border-none gap-0 p-0">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`tab-item ${path.startsWith(l.href) ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
