import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VEEW Connect 2026',
  description: 'Nền tảng kết nối B2B — Vietnam Event & Exhibition Week 17–19/10/2026',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
