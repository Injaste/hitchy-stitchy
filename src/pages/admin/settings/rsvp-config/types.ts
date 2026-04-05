export type RSVPMode = 'open' | 'pool' | 'both'

export interface RSVPConfig {
  mode: RSVPMode
  showPhone: boolean
  showEmail: boolean
  showDietary: boolean
  showMessage: boolean
  showGuestsCount: boolean
  guestMin: number
  guestMax: number
}
