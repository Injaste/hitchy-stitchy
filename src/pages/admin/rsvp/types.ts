export type RSVPStatus = 'pending' | 'confirmed' | 'declined'

export interface RSVPEntry {
  id: string
  eventId: string
  name: string
  phone?: string
  email?: string
  guestsCount: number
  dietaryNotes?: string
  message?: string
  status: RSVPStatus
  submittedAt: string
  updatedAt: string
}
