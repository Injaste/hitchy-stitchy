export const adminKeys = {
  timeline: (slug: string) => [slug, 'timeline'] as const,
  checklist: (slug: string) => [slug, 'checklist'] as const,
  team: (slug: string) => [slug, 'team'] as const,
  liveLogs: (slug: string) => [slug, 'live-logs'] as const,
  rsvps: (slug: string) => [slug, 'rsvps'] as const,
  settingsEvent: (slug: string) => [slug, 'settings', 'event'] as const,
  settingsRsvpConfig: (slug: string) => [slug, 'settings', 'rsvp-config'] as const,
  settingsAppearance: (slug: string) => [slug, 'settings', 'appearance'] as const,
  settingsNotifications: (slug: string, memberId: string) =>
    [slug, 'settings', 'notifications', memberId] as const,
}
