import { useState, useEffect } from "react";
import AccessTableHeader from "@/pages/admin/access/components/AccessTableHeader";
import AccessTableBody from "@/pages/admin/access/components/AccessTableBody";
import type { AccessGroup, AccessLevel } from "@/pages/admin/access/types";

// The real Access matrix (AccessTableHeader + AccessTableBody + LevelBadge),
// composed with static counts so no query fires. The "Team" group's permissions
// cycle — granting access step by step. Cells are icon-only, so swapping a level
// never changes the row height.
const RESOURCES = ["timeline", "tasks", "budget", "gifts", "guests", "members"];

// What "Team" can do, granted progressively. Admin stays full throughout.
const TEAM_PHASES: Record<string, AccessLevel>[] = [
  { timeline: "read", tasks: "none", budget: "none", gifts: "none", guests: "read", members: "none" },
  { timeline: "read", tasks: "read", budget: "read", gifts: "none", guests: "read", members: "read" },
  { timeline: "full", tasks: "full", budget: "read", gifts: "read", guests: "full", members: "read" },
];

const ADMIN_PERMS: Record<string, AccessLevel> = {
  timeline: "full",
  tasks: "full",
  budget: "full",
  gifts: "full",
  guests: "full",
  members: "full",
};

const mkGroup = (
  id: string,
  name: string,
  permissions: Record<string, AccessLevel>,
): AccessGroup => ({
  id,
  event_id: "demo",
  name,
  permissions,
  created_at: "",
  updated_at: "",
});

export function AccessShowcase() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p + 1) % TEAM_PHASES.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  const accessGroups: AccessGroup[] = [
    mkGroup("admin", "Admin", ADMIN_PERMS),
    mkGroup("team", "Team", TEAM_PHASES[phase]),
  ];
  const memberCounts = { admin: 2, team: 5 };
  const colCount = 2 + accessGroups.length;
  const groupColWidth = `${Math.floor(100 / (accessGroups.length + 1))}%`;

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-lg select-none">
      <table className="w-full text-sm border-separate border-spacing-0">
        <AccessTableHeader
          accessGroups={accessGroups}
          memberCounts={memberCounts}
          groupColWidth={groupColWidth}
        />
        <AccessTableBody
          accessGroups={accessGroups}
          availableResources={RESOURCES}
          colCount={colCount}
        />
      </table>
    </div>
  );
}
