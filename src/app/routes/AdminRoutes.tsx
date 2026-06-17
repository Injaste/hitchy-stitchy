import { lazy } from "react";
import { Route, Navigate, useParams } from "react-router-dom";
import RequireRead from "@/components/custom/require-read";
import RequireSuperAdmin from "@/components/custom/require-super-admin";
import ComponentFade from "@/components/animations/animate-component-fade";

import Timeline from "@/pages/admin/timeline";
import Tasks from "@/pages/admin/tasks";
import Members from "@/pages/admin/members";
import Access from "@/pages/admin/access";
import Guests from "@/pages/admin/guests";
import Budget from "@/pages/admin/budget";
import Gifts from "@/pages/admin/gifts";
import Invitation from "@/pages/admin/invitation";
import Settings from "@/pages/admin/settings";

const Admin = lazy(() => import("@/pages/admin"));

// Absolute redirect built from the slug. A relative `<Navigate to="timeline">`
// resolves by appending to the current URL inside a splat (`*`) route, which
// turns an unknown sub-path into an infinite /timeline/timeline/… loop.
const RedirectToTimeline = () => {
  const { slug } = useParams();
  return <Navigate to={`/${slug}/admin/timeline`} replace />;
};

const AdminRoutes = () => (
  <Route
    path="/:slug/admin"
    element={
      <ComponentFade>
        <Admin />
      </ComponentFade>
    }
  >
    <Route index element={<RedirectToTimeline />} />
    <Route path="timeline" element={<RequireRead resource="timeline"><Timeline /></RequireRead>} />
    <Route path="tasks" element={<RequireRead resource="tasks"><Tasks /></RequireRead>} />
    <Route path="members" element={<Members />} />
    <Route path="access" element={<RequireRead resource="access"><Access /></RequireRead>} />
    <Route path="guests" element={<RequireRead resource="guests"><Guests /></RequireRead>} />
    <Route path="budget" element={<RequireSuperAdmin><Budget /></RequireSuperAdmin>} />
    <Route path="gifts" element={<RequireSuperAdmin><Gifts /></RequireSuperAdmin>} />
    <Route path="invitation" element={<RequireRead resource="invitation"><Invitation /></RequireRead>} />
    <Route path="details" element={<Navigate to="../invitation" replace />} />
    <Route path="themes" element={<Navigate to="../invitation" replace />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<RedirectToTimeline />} />
  </Route>
);

export default AdminRoutes;
