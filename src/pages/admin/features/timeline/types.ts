export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  assignees: string[];
  isMainEvent?: boolean;
  notes?: string;
  startedAt?: string;
}
