'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin/buyers', label: 'Buyers' },
  { href: '/admin/exhibitors', label: 'Exhibitors' },
  { href: '/admin/meetings', label: 'Meetings' },
  { href: '/admin/import', label: 'Import' },
  { href: '/admin/create-exhibitor', label: 'Tạo Exhibitor' },
  { href: '/admin/matching', label: '✨ Smart Match' },
]

export default function AdminNav() {
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
              style={path.startsWith(l.href) ? { background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' } : {}}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
