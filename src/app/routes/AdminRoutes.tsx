import { Route, Navigate } from "react-router-dom";

import Admin from "@/pages/admin";
import TimelineTab from "@/pages/admin/timeline";
import { ChecklistTab } from "@/pages/admin/checklist";
import { TeamTab } from "@/pages/admin/team";
import { LiveTab } from "@/pages/admin/live";
import { RSVPTab } from "@/pages/admin/rsvp";
import { UsersTab } from "@/pages/admin/users";
import { SettingsTab } from "@/pages/admin/settings";

const adminChildRoutes = [
  { index: true, element: <Navigate to="timeline" replace /> },
  { path: "timeline", element: <TimelineTab /> },
  { path: "checklist", element: <ChecklistTab /> },
  { path: "team", element: <TeamTab /> },
  { path: "live", element: <LiveTab /> },
  { path: "rsvp", element: <RSVPTab /> },
  { path: "users", element: <UsersTab /> },
  { path: "settings", element: <SettingsTab /> },
];

const AdminRoutes = () => (
  <Route path="/:slug/admin" element={<Admin />}>
    {adminChildRoutes.map((r, i) =>
      r.index ? (
        <Route key={i} index element={r.element} />
      ) : (
        <Route key={r.path} path={r.path} element={r.element} />
      ),
    )}
  </Route>
);

export default AdminRoutes;
