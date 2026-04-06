import type { TimelineEvent } from './types'

export const MOCK_EVENT_ID = 'mock-event-001'

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'a1b2c3d4-1111-4aaa-bbbb-000000000001',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    timeStart: '09:00 AM',
    title: 'Bridal Prep',
    description: 'Hair and makeup at the bridal suite',
    isMainEvent: false,
    assignees: [
      { roleId: 'role-001', roleName: 'Bride', roleShortName: 'BR' },
      { roleId: 'role-003', roleName: 'Bridesmaid', roleShortName: 'BM' },
    ],
  },
  {
    id: 'a1b2c3d4-1111-4aaa-bbbb-0000000000099',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    timeStart: '09:00 AM',
    title: 'Bridal To Love Groom',
    description: 'Hair and makeup at the bridal suite',
    isMainEvent: false,
    assignees: [
      { roleId: 'role-001', roleName: 'Bride', roleShortName: 'BR' },
    ],
  },
  {
    id: 'a1b2c3d4-1111-4aaa-bbbb-000000000002',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    timeStart: '02:00 PM',
    title: 'Ceremony',
    description: 'Exchange of vows at the garden pavilion',
    isMainEvent: true,
    assignees: [
      { roleId: 'role-001', roleName: 'Bride', roleShortName: 'BR' },
      { roleId: 'role-002', roleName: 'Groom', roleShortName: 'GR' },
    ],
  },
  {
    id: 'a1b2c3d4-1111-4aaa-bbbb-000000000003',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    timeStart: '03:30 PM',
    title: 'Photo Session',
    description: 'Group photos at the lakeside',
    isMainEvent: false,
    assignees: [
      { roleId: 'role-004', roleName: 'Coordinator', roleShortName: 'CO' },
    ],
  },
  {
    id: 'a1b2c3d4-1111-4aaa-bbbb-000000000004',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    timeStart: '06:00 PM',
    title: 'Reception Dinner',
    description: 'Dinner and speeches in the grand hall',
    isMainEvent: true,
    assignees: [],
  },
  {
    id: 'a1b2c3d4-1111-4aaa-bbbb-000000000005',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-2',
    timeStart: '10:00 AM',
    title: 'Farewell Brunch',
    description: 'Casual brunch for guests before departure',
    isMainEvent: false,
    assignees: [
      { roleId: 'role-004', roleName: 'Coordinator', roleShortName: 'CO' },
    ],
  },
]
