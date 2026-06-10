import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import RequireRead from "@/components/custom/require-read";
import ComponentFade from "@/components/animations/animate-component-fade";

import Timeline from "@/pages/admin/timeline";
import Tasks from "@/pages/admin/tasks";
import Members from "@/pages/admin/members";
import Access from "@/pages/admin/access";
import Guests from "@/pages/admin/guests";
import Budget from "@/pages/admin/budget";
import Invitation from "@/pages/admin/invitation";
import Settings from "@/pages/admin/settings";

const Admin = lazy(() => import("@/pages/admin"));

const AdminRoutes = () => (
  <Route
    path="/:slug/admin"
    element={
      <ComponentFade>
        <Admin />
      </ComponentFade>
    }
  >
    <Route index element={<Navigate to="timeline" replace />} />
    <Route path="timeline" element={<RequireRead resource="timeline"><Timeline /></RequireRead>} />
    <Route path="tasks" element={<RequireRead resource="tasks"><Tasks /></RequireRead>} />
    <Route path="members" element={<Members />} />
    <Route path="access" element={<RequireRead resource="access"><Access /></RequireRead>} />
    <Route path="guests" element={<RequireRead resource="guests"><Guests /></RequireRead>} />
    <Route path="budget-tracker" element={<RequireRead resource="budget"><Budget /></RequireRead>} />
    <Route path="invitation" element={<RequireRead resource={["invitation", "themes"]}><Invitation /></RequireRead>} />
    <Route path="details" element={<Navigate to="../invitation" replace />} />
    <Route path="themes" element={<Navigate to="../invitation" replace />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<Navigate to="timeline" replace />} />
  </Route>
);

export default AdminRoutes;
