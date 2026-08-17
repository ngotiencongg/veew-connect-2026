'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavBarProps {
  userName?: string
  logoutRedirect?: string
}

export default function NavBar({ userName, logoutRedirect = '/' }: NavBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(logoutRedirect)
    router.refresh()
  }

  return (
    <nav className="nav-bar">
      <Link href="/" className="gradient-text font-bold text-lg">
        VEEW Connect 2026
      </Link>
      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-sm hidden sm:block" style={{ color: 'var(--muted)' }}>
            {userName}
          </span>
        )}
        <button onClick={handleLogout} className="btn-outline text-xs px-3 py-1.5">
          Đăng xuất
        </button>
      </div>
    </nav>
  )
}
