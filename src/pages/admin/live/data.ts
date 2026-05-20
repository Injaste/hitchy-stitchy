import type { LiveLog } from './types'

export const MOCK_EVENT_ID = 'mock-event-001'
export const MOCK_MEMBER_ID = 'mock-member-001'

export const mockLiveLogs: LiveLog[] = [
  {
    id: 'd4e5f6a7-4444-4ddd-eeee-000000000001',
    event_id: MOCK_EVENT_ID,
    member_id: MOCK_MEMBER_ID,
    member_display_name: 'Sarah',
    role: 'Bride',
    type: 'ready',
    msg: 'Hair and makeup done, ready to go!',
    created_at: '2026-04-04T08:45:00Z',
  },
  {
    id: 'd4e5f6a7-4444-4ddd-eeee-000000000002',
    event_id: MOCK_EVENT_ID,
    member_id: 'c3d4e5f6-3333-4ccc-dddd-000000000004',
    member_display_name: 'Mike',
    role: 'Coordinator',
    type: 'cue_started',
    msg: 'Bridal Prep cue started',
    created_at: '2026-04-04T09:00:00Z',
  },
  {
    id: 'd4e5f6a7-4444-4ddd-eeee-000000000003',
    event_id: MOCK_EVENT_ID,
    member_id: 'c3d4e5f6-3333-4ccc-dddd-000000000003',
    member_display_name: 'Emily',
    role: 'Bridesmaid',
    type: 'running_late',
    msg: 'Running 10 mins late, traffic on the highway',
    created_at: '2026-04-04T09:15:00Z',
  },
  {
    id: 'd4e5f6a7-4444-4ddd-eeee-000000000004',
    event_id: MOCK_EVENT_ID,
    member_id: 'c3d4e5f6-3333-4ccc-dddd-000000000004',
    member_display_name: 'Mike',
    role: 'Coordinator',
    type: 'task_done',
    msg: 'Ceremony chairs set up complete',
    created_at: '2026-04-04T10:30:00Z',
  },
  {
    id: 'd4e5f6a7-4444-4ddd-eeee-000000000005',
    event_id: MOCK_EVENT_ID,
    member_id: 'c3d4e5f6-3333-4ccc-dddd-000000000005',
    member_display_name: 'Tom',
    role: 'Usher',
    type: 'help_needed',
    msg: 'Need more chairs for back row',
    created_at: '2026-04-04T11:00:00Z',
  },
]
