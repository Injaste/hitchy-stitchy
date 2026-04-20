export const adminKeys = {
  timeline: (slug: string) => [slug, 'timeline'] as const,
  tasks: (slug: string) => [slug, 'tasks'] as const,
  taskOrder: (slug: string) => [slug, 'task-order'] as const,
  members: (slug: string) => [slug, 'members'] as const,
  roles: (slug: string) => [slug, 'roles'] as const,
  liveLogs: (slug: string) => [slug, 'live-logs'] as const,
  invitation: (slug: string) => [slug, 'invitation'] as const,
  guests: (slug: string) => [slug, 'guests'] as const,
  pages: (slug: string) => [slug, 'pages'] as const,
  themes: (slug: string) => [slug, 'themes'] as const,
  settingsEvent: (slug: string) => [slug, 'settings', 'event'] as const,
  settingsAppearance: (slug: string) => [slug, 'settings', 'appearance'] as const,
  settingsNotifications: (slug: string, memberId: string) =>
    [slug, 'settings', 'notifications', memberId] as const,
}
