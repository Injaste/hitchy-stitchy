import type { Task } from './types'

export const MOCK_EVENT_ID = 'mock-event-001'
export const MOCK_MEMBER_ID = 'mock-member-001'

export const mockTasks: Task[] = [
  {
    id: 'b1c2d3e4-2222-4bbb-cccc-000000000001',
    eventId: MOCK_EVENT_ID,
    dayId: 'pre-wedding',
    title: 'Confirm florist delivery time',
    notes: 'Call the florist to confirm 8 AM delivery',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-04-03',
    checklist: [
      { id: 'cl-001', label: 'Call florist', done: true },
      { id: 'cl-002', label: 'Confirm arrangements list', done: false },
    ],
    assignees: [
      { roleId: 'role-004', roleName: 'Coordinator', roleShortName: 'CO' },
    ],
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-28T14:00:00Z',
  },
  {
    id: 'b1c2d3e4-2222-4bbb-cccc-000000000002',
    eventId: MOCK_EVENT_ID,
    dayId: 'pre-wedding',
    title: 'Send final guest list to caterer',
    priority: 'high',
    status: 'done',
    completedAt: '2026-03-30T09:00:00Z',
    completedByMemberId: MOCK_MEMBER_ID,
    checklist: [],
    assignees: [
      { roleId: 'role-001', roleName: 'Bride', roleShortName: 'BR' },
    ],
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-03-30T09:00:00Z',
  },
  {
    id: 'b1c2d3e4-2222-4bbb-cccc-000000000003',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    title: 'Set up ceremony chairs',
    notes: '120 chairs in garden rows',
    priority: 'medium',
    status: 'in_progress',
    checklist: [
      { id: 'cl-003', label: 'Unload chairs from van', done: true },
      { id: 'cl-004', label: 'Arrange in rows of 10', done: false },
      { id: 'cl-005', label: 'Add sashes to aisle chairs', done: false },
    ],
    assignees: [
      { roleId: 'role-004', roleName: 'Coordinator', roleShortName: 'CO' },
      { roleId: 'role-003', roleName: 'Bridesmaid', roleShortName: 'BM' },
    ],
    createdAt: '2026-03-25T12:00:00Z',
    updatedAt: '2026-04-04T07:00:00Z',
  },
  {
    id: 'b1c2d3e4-2222-4bbb-cccc-000000000004',
    eventId: MOCK_EVENT_ID,
    dayId: 'day-1',
    title: 'Test AV equipment for speeches',
    priority: 'low',
    status: 'todo',
    checklist: [],
    assignees: [],
    createdAt: '2026-03-28T16:00:00Z',
    updatedAt: '2026-03-28T16:00:00Z',
  },
]
