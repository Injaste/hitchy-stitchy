export type RSVPStatus = 'pending' | 'confirmed' | 'cancelled'

export interface RSVPEntry {
  id: string
  event_id: string
  name: string
  phone: string
  guest_count: number
  message: string | null
  status: RSVPStatus
  source: 'pool' | 'public'
  cancel_token: string
  created_at: string
  updated_at: string
}
