import { Route, Navigate } from "react-router-dom";

import Admin from "@/pages/admin";
import TimelineTab from "@/pages/admin/timeline";
import Tasks from "@/pages/admin/tasks";
import Members from "@/pages/admin/members";
import Roles from "@/pages/admin/roles";
import { LiveTab } from "@/pages/admin/live";
import { RSVPTab } from "@/pages/admin/rsvp";
import { SettingsTab } from "@/pages/admin/settings";
import Vendor from "@/pages/admin/vendor";
import InvitationView from "@/pages/admin/invitation";
import ThemesView from "@/pages/admin/themes";

const adminChildRoutes = [
  { index: true, element: <Navigate to="timeline" replace /> },
  { path: "timeline", element: <TimelineTab /> },
  { path: "tasks", element: <Tasks /> },
  { path: "members", element: <Members /> },
  { path: "roles", element: <Roles /> },
  { path: "vendor", element: <Vendor /> },
  { path: "live", element: <LiveTab /> },
  { path: "invitation", element: <InvitationView /> },
  { path: "themes", element: <ThemesView /> },
  { path: "rsvp", element: <RSVPTab /> },
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
