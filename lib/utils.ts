import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format time string '09:00:00' → '09:00' */
export function formatTime(t: string) {
  return t?.slice(0, 5) ?? ''
}

/** Format date '2026-10-17' → '17/10/2026' */
export function formatDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

/** Format date '2026-10-17' → '17/10' */
export function formatDateShort(d: string) {
  if (!d) return ''
  const [, m, day] = d.split('-')
  return `${day}/${m}`
}

/** Generate a random password */
export function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Status badge styling */
export function statusColor(status: string) {
  switch (status) {
    case 'approved':  case 'confirmed': return 'bg-green-500/15 text-green-400 border-green-500/30'
    case 'pending':   return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    case 'rejected':  case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/30'
    default:          return 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  }
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending:   'Chờ phê duyệt',
    approved:  'Đã phê duyệt',
    rejected:  'Từ chối',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã huỷ',
    arranged:  'Đã sắp xếp',
  }
  return map[status] ?? status
}
