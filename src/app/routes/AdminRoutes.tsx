import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

import TimelineTab from "@/pages/admin/timeline";
import Tasks from "@/pages/admin/tasks";
import Members from "@/pages/admin/members";
import Roles from "@/pages/admin/roles";
import Permissions from "@/pages/admin/permissions";
import Guests from "@/pages/admin/guests";
import Invitation from "@/pages/admin/invitation";

const Admin = lazy(() => import("@/pages/admin"));

const AdminRoutes = () => (
  <Route path="/:slug/admin" element={<Admin />}>
    <Route index element={<Navigate to="timeline" replace />} />
    <Route path="timeline" element={<TimelineTab />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="members" element={<Members />} />
    <Route path="roles" element={<Roles />} />
    <Route path="permissions" element={<Permissions />} />
    <Route path="guests" element={<Guests />} />
    <Route path="invitation" element={<Invitation />} />
    <Route path="details" element={<Navigate to="../invitation" replace />} />
    <Route path="themes" element={<Navigate to="../invitation" replace />} />
  </Route>
);

export default AdminRoutes;
