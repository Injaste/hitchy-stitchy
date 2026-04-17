export const adminKeys = {
  timeline: (slug: string) => [slug, 'timeline'] as const,
  tasks: (slug: string) => [slug, 'tasks'] as const,
  members: (slug: string) => [slug, 'members'] as const,
  roles: (slug: string) => [slug, 'roles'] as const,
  liveLogs: (slug: string) => [slug, 'live-logs'] as const,
  rsvps: (slug: string) => [slug, 'rsvps'] as const,
  settingsEvent: (slug: string) => [slug, 'settings', 'event'] as const,
  settingsRsvpConfig: (slug: string) => [slug, 'settings', 'rsvp-config'] as const,
  settingsAppearance: (slug: string) => [slug, 'settings', 'appearance'] as const,
  settingsNotifications: (slug: string, memberId: string) =>
    [slug, 'settings', 'notifications', memberId] as const,
}
