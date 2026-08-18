'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerBuyer } from '@/app/actions/buyer'
import { INDUSTRY_OPTIONS } from '@/types'

export default function BuyerRegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await registerBuyer(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-5"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(123,47,190,.15) 0%, transparent 50%), var(--dark)' }}
      >
        <div className="card p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-3">Đăng ký thành công!</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Hồ sơ của bạn đang chờ phê duyệt từ Ban Tổ Chức VEEW 2026.
            Khi được phê duyệt, thông tin đăng nhập sẽ được gửi qua email.
          </p>
          <Link href="/" className="btn-grad inline-block">Quay lại trang chủ</Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(123,47,190,.15) 0%, transparent 50%), var(--dark)' }}
    >
      <div className="card p-10 w-full max-w-lg">
        <Link href="/buyer/login" className="text-xs mb-6 block" style={{ color: 'var(--muted)' }}>← Quay lại đăng nhập</Link>
        <h2 className="text-2xl font-bold mb-1">Đăng ký Hosted Buyer</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Điền thông tin để đăng ký tham gia VEEW 2026 với tư cách Hosted Buyer
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Họ và tên *</label>
              <input name="fullName" className="input" placeholder="Nguyễn Văn A" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email *</label>
              <input name="email" className="input" type="email" placeholder="email@company.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Công ty *</label>
              <input name="company" className="input" placeholder="Tên công ty" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Chức vụ</label>
              <input name="position" className="input" placeholder="CEO, Manager..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Số điện thoại</label>
              <input name="phone" className="input" placeholder="+84 xxx xxx xxx" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Quốc gia</label>
              <input name="country" className="input" placeholder="Việt Nam" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Ngành nghề</label>
            <select name="industry" className="input">
              <option value="">-- Chọn ngành --</option>
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Nhu cầu tìm kiếm / Sản phẩm quan tâm *</label>
            <textarea name="needs" className="input min-h-[80px] resize-none" placeholder="VD: Tìm kiếm đối tác cung cấp giải pháp chuyển đổi số..." required />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-grad w-full mt-2">
            {loading ? 'Đang gửi...' : 'Gửi đăng ký'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Đã có tài khoản?{' '}
          <Link href="/buyer/login" className="text-purple-400 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </main>
  )
}
