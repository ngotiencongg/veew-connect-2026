'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/exhibitor/slots', label: 'Quản lý slot' },
  { href: '/exhibitor/requests', label: 'Yêu cầu gặp' },
  { href: '/exhibitor/propose', label: 'Đề xuất gặp' },
  { href: '/exhibitor/confirmed', label: 'Lịch xác nhận' },
  { href: '/exhibitor/settings', label: 'Cài đặt' },
]

export default function ExhibitorNav() {
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
              style={path.startsWith(l.href) ? { background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' } : {}}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
