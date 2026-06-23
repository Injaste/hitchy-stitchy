export interface Timeline {
  id: string;
  event_id: string;
  day: string;
  segment_id: string;
  label: string | null;
  time_start: string;
  time_end: string | null;
  title: string;
  details: string | null;
  assignees: string[];
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export type CardLifecycle = "start" | "end" | "done" | null;
