import Link from 'next/link'

const portals = [
  {
    href: '/buyer/login',
    icon: '🛒',
    title: 'Hosted Buyer',
    desc: 'Duyệt và đặt lịch gặp gỡ với các exhibitors & speakers',
    color: 'hover:border-purple-500',
  },
  {
    href: '/exhibitor/login',
    icon: '🏢',
    title: 'Exhibitor / Speaker',
    desc: 'Quản lý lịch tiếp khách và đề xuất cuộc gặp với buyers',
    color: 'hover:border-pink-500',
  },
  {
    href: '/admin/login',
    icon: '⚙️',
    title: 'Ban Tổ Chức',
    desc: 'Quản lý toàn bộ hệ thống, phê duyệt và sắp xếp cuộc gặp',
    color: 'hover:border-cyan-500',
  },
]

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(123,47,190,.2) 0%, transparent 60%), var(--dark)' }}
    >
      {/* Badge */}
      <span
        className="inline-block mb-6 px-4 py-1 rounded-full text-xs font-semibold"
        style={{ background: 'rgba(123,47,190,.2)', border: '1px solid rgba(123,47,190,.4)', color: '#C084FC' }}
      >
        Vietnam Event &amp; Exhibition Week • 17–19/10/2026
      </span>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
        Kết nối <span className="gradient-text">B2B</span> thông minh
      </h1>
      <p className="text-base mb-12 max-w-lg" style={{ color: 'var(--muted)' }}>
        Nền tảng kết nối Hosted Buyers với Exhibitors &amp; Speakers tại VEEW 2026
        — Vietnam Exposition Center, Hà Nội
      </p>

      {/* Portal cards */}
      <div className="flex flex-wrap justify-center gap-5">
        {portals.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`card p-8 w-64 text-left transition-all duration-200 ${p.color} hover:-translate-y-1 hover:shadow-2xl`}
            style={{ boxShadow: 'none' }}
          >
            <div className="text-4xl mb-4">{p.icon}</div>
            <h3 className="font-bold text-lg mb-2">{p.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{p.desc}</p>
            <div className="mt-4 text-purple-400 text-lg">→</div>
          </Link>
        ))}
      </div>

      <p className="mt-16 text-xs" style={{ color: 'var(--muted)' }}>
        © 2026 VEEW — Vietnam Event &amp; Exhibition Week
      </p>
    </main>
  )
}
