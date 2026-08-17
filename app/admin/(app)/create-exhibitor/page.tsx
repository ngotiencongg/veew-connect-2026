'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createExhibitorAccount } from '@/app/actions/exhibitor'
import { EXHIBITOR_CATEGORIES, INDUSTRY_OPTIONS } from '@/types'

export default function CreateExhibitorPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createExhibitorAccount(formData)
      if (result.error) {
        setFeedback({ type: 'error', msg: result.error })
      } else {
        setFeedback({ type: 'success', msg: 'Tài khoản Exhibitor đã được tạo và thông tin đăng nhập đã gửi qua email!' })
        setTimeout(() => router.push('/admin/exhibitors'), 2000)
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/exhibitors" className="text-sm" style={{ color: 'var(--muted)' }}>← Exhibitors</Link>
        <h1 className="text-xl font-bold">Tạo tài khoản Exhibitor / Speaker</h1>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Họ tên đại diện *</label>
            <input name="fullName" className="input" placeholder="Nguyễn Văn A" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email đăng nhập *</label>
            <input name="email" className="input" type="email" placeholder="contact@company.com" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Tên công ty / đơn vị *</label>
            <input name="company" className="input" placeholder="Tên công ty" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Loại *</label>
            <select name="category" className="input" required>
              <option value="">-- Chọn loại --</option>
              {EXHIBITOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Số booth</label>
            <input name="boothNumber" className="input" placeholder="A01" />
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
            {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Website</label>
          <input name="website" className="input" type="url" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mô tả ngắn</label>
          <textarea name="description" className="input min-h-[80px] resize-none"
            placeholder="Giới thiệu về công ty / speaker..." />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/admin/exhibitors" className="btn-outline flex-1 text-center">Huỷ</Link>
          <button type="submit" disabled={isPending} className="btn-grad flex-1"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' }}>
            {isPending ? 'Đang tạo...' : 'Tạo tài khoản & gửi email'}
          </button>
        </div>
      </form>

      <div className="card p-4 mt-4 text-sm" style={{ background: 'rgba(0,188,212,.05)', borderColor: 'rgba(0,188,212,.2)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          ℹ️ Mật khẩu sẽ được tạo tự động và gửi qua email cùng với hướng dẫn đăng nhập.
          Exhibitor có thể đổi mật khẩu sau khi đăng nhập lần đầu.
        </p>
      </div>
    </div>
  )
}
