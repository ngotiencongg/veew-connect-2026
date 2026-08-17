import Link from 'next/link'

export default function BuyerPendingPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(123,47,190,.15) 0%, transparent 50%), var(--dark)' }}
    >
      <div className="card p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold mb-3">Đang chờ phê duyệt</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
          Hồ sơ Hosted Buyer của bạn đang được Ban Tổ Chức VEEW 2026 xem xét.
          Khi được phê duyệt, thông tin đăng nhập sẽ được gửi đến email của bạn.
        </p>
        <p className="text-xs mb-8" style={{ color: 'var(--muted)' }}>
          Cần hỗ trợ? Liên hệ: <a href="mailto:info@veew.vn" className="text-purple-400 hover:underline">info@veew.vn</a>
        </p>
        <Link href="/" className="btn-outline inline-block">Quay lại trang chủ</Link>
      </div>
    </main>
  )
}
