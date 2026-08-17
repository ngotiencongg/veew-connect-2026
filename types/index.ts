export type Role = 'buyer' | 'exhibitor' | 'admin'
export type Status = 'pending' | 'approved' | 'rejected'
export type MeetingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled'
export type ProposalStatus = 'pending' | 'arranged' | 'rejected'

export interface Profile {
  id: string
  role: Role
  name: string
  company?: string
  position?: string
  phone?: string
  industry?: string
  needs?: string
  country?: string
  buyer_type?: 'International' | 'Domestic'
  status: Status
  internal_notes?: string
  created_at: string
}

export interface Exhibitor {
  id: string
  user_id?: string
  name: string
  category: string
  booth?: string
  emoji?: string
  description?: string
  contact_name: string
  email: string
  website?: string
  created_at: string
}

export interface Slot {
  id: string
  exhibitor_id: string
  event_date: string      // 'YYYY-MM-DD'
  start_time: string      // 'HH:MM:SS'
  duration_mins: number
  venue: string
  is_open: boolean
  exhibitors?: Exhibitor  // joined
}

export interface Meeting {
  id: string
  buyer_id: string
  exhibitor_id: string
  slot_id?: string
  event_date: string
  start_time: string
  venue: string
  status: MeetingStatus
  notes?: string
  arranged_by?: string
  created_at: string
  // Joined fields
  profiles?: Profile          // buyer profile
  exhibitors?: Exhibitor
}

export interface Proposal {
  id: string
  exhibitor_id: string
  buyer_id?: string
  buyer_email?: string
  message: string
  status: ProposalStatus
  meeting_id?: string
  created_at: string
  exhibitors?: Exhibitor
  profiles?: Profile
}

export interface ImportBuyerRow {
  name: string
  company: string
  email: string
  phone?: string
  position?: string
  industry?: string
  country?: string
  buyer_type?: string
  needs?: string
  internal_notes?: string
}

// Event dates
export const EVENT_DATES = [
  { date: '2026-10-17', label: 'Thứ Sáu, 17/10/2026', short: '17/10' },
  { date: '2026-10-18', label: 'Thứ Bảy, 18/10/2026', short: '18/10' },
  { date: '2026-10-19', label: 'Chủ Nhật, 19/10/2026', short: '19/10' },
]

export const VENUE_OPTIONS = [
  'Buyers Lounge, Hall 5-6',
  'Gian hàng của tôi',
  'Phòng họp A',
  'Phòng họp B',
  'Online / Video call',
]

export const INDUSTRY_OPTIONS = [
  'MICE & Event Management',
  'Hospitality & Tourism',
  'Exhibition Services',
  'Technology & AV',
  'Marketing & Communications',
  'Government & Association',
  'Banking & Finance',
  'Real Estate',
  'Aviation & Travel',
  'Other',
]

export const EXHIBITOR_CATEGORIES = [
  'Exhibition Services',
  'MICE & Event Technology',
  'Destination Management',
  'AV & Technology',
  'Hospitality & Hotel',
  'Print & Signage',
  'Sustainability & Green',
  'Speakers & Training',
  'Logistics & Transport',
]
