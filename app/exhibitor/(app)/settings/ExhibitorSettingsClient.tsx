'use client'
import { useState, useTransition } from 'react'
import { updateExhibitorProfile } from '@/app/actions/exhibitor'
import { changePassword } from '@/app/actions/buyer'
import { EXHIBITOR_CATEGORIES } from '@/types'

export default function ExhibitorSettingsClient({
  profile, exhibitor,
}: {
  profile: any
  exhibitor: any
}) {
  const [tab, setTab] = useState<'profile' | 'password'>('profile')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateExhibitorProfile(formData)
      setFeedback(result.error ? { type: 'error', msg: result.error } : { type: 'success', msg: 'Cập nhật thành công!' })
    })
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setFeedback({ type: 'error', msg: 'Mật khẩu mới không khớp.' }); return }
    if (newPw.length < 8) { setFeedback({ type: 'error', msg: 'Mật khẩu mới phải từ 8 ký tự.' }); return }
    startTransition(async () => {
      const result = await changePassword(currentPw, newPw)
      if (result.error) {
        setFeedback({ type: 'error', msg: result.error })
      } else {
        setFeedback({ type: 'success', msg: 'Đổi mật khẩu thành công!' })
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">Cài đặt tài khoản</h1>

      <div className="tab-bar mb-6">
        <button className={`tab-item ${tab === 'profile' ? 'active' : ''}`}
          style={tab === 'profile' ? { background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' } : {}}
          onClick={() => setTab('profile')}>Hồ sơ</button>
        <button className={`tab-item ${tab === 'password' ? 'active' : ''}`}
          style={tab === 'password' ? { background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' } : {}}
          onClick={() => setTab('password')}>Đổi mật khẩu</button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
          {feedback.msg}
          <button className="ml-3 underline text-xs" onClick={() => setFeedback(null)}>Đóng</button>
        </div>
      )}

      {tab === 'profile' && (
        <form onSubmit={handleProfile} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Họ và tên đại diện</label>
              <input name="fullName" className="input" defaultValue={profile?.full_name} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
              <input className="input opacity-50 cursor-not-allowed" value={profile?.email} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Tên công ty</label>
              <input name="company" className="input" defaultValue={exhibitor?.company_name ?? profile?.company} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Số booth</label>
              <input name="boothNumber" className="input" defaultValue={exhibitor?.booth_number ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Số điện thoại</label>
              <input name="phone" className="input" defaultValue={profile?.phone ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Quốc gia</label>
              <input name="country" className="input" defaultValue={profile?.country ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Website</label>
            <input name="website" className="input" type="url" defaultValue={exhibitor?.website ?? ''} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Giới thiệu công ty</label>
            <textarea name="description" className="input min-h-[80px] resize-none" defaultValue={exhibitor?.description ?? ''} />
          </div>
          <button type="submit" disabled={isPending} className="btn-grad"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' }}>
            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePassword} className="card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mật khẩu hiện tại</label>
            <input className="input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mật khẩu mới</label>
            <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Xác nhận mật khẩu mới</label>
            <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
          </div>
          <button type="submit" disabled={isPending} className="btn-grad"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #7B2FBE)' }}>
            {isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      )}
    </div>
  )
}
