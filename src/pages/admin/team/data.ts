import type { Role, TeamMember } from './types'

export const MOCK_EVENT_ID = 'mock-event-001'
export const MOCK_MEMBER_ID = 'mock-member-001'

export const mockRoles: Role[] = [
  { id: 'role-001', eventId: MOCK_EVENT_ID, name: 'Bride', shortName: 'BR', category: 'root' },
  { id: 'role-002', eventId: MOCK_EVENT_ID, name: 'Groom', shortName: 'GR', category: 'root' },
  { id: 'role-003', eventId: MOCK_EVENT_ID, name: 'Bridesmaid', shortName: 'BM', category: 'couple_attendant' },
  { id: 'role-004', eventId: MOCK_EVENT_ID, name: 'Coordinator', shortName: 'CO', category: 'admin' },
  { id: 'role-005', eventId: MOCK_EVENT_ID, name: 'Usher', shortName: 'US', category: 'general' },
]

export const mockMembers: TeamMember[] = [
  {
    id: MOCK_MEMBER_ID,
    eventId: MOCK_EVENT_ID,
    roleId: 'role-001',
    role: mockRoles[0],
    displayName: 'Sarah',
    email: 'sarah@example.com',
    isActive: true,
    joinedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'c3d4e5f6-3333-4ccc-dddd-000000000002',
    eventId: MOCK_EVENT_ID,
    roleId: 'role-002',
    role: mockRoles[1],
    displayName: 'James',
    email: 'james@example.com',
    isActive: true,
    joinedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'c3d4e5f6-3333-4ccc-dddd-000000000003',
    eventId: MOCK_EVENT_ID,
    roleId: 'role-003',
    role: mockRoles[2],
    displayName: 'Emily',
    email: 'emily@example.com',
    isActive: true,
    joinedAt: '2026-03-05T12:00:00Z',
  },
  {
    id: 'c3d4e5f6-3333-4ccc-dddd-000000000004',
    eventId: MOCK_EVENT_ID,
    roleId: 'role-004',
    role: mockRoles[3],
    displayName: 'Mike',
    email: 'mike@example.com',
    isActive: true,
    joinedAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 'c3d4e5f6-3333-4ccc-dddd-000000000005',
    eventId: MOCK_EVENT_ID,
    roleId: 'role-005',
    role: mockRoles[4],
    displayName: 'Tom',
    email: 'tom@example.com',
    isActive: false,
    joinedAt: '2026-03-10T14:00:00Z',
  },
]
