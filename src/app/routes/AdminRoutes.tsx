import { lazy } from "react";
import { Route, Navigate, useParams } from "react-router-dom";
import RequireRoute from "@/components/custom/require-route";
import ComponentFade from "@/components/animations/animate-component-fade";

import Timeline from "@/pages/admin/timeline";
import Tasks from "@/pages/admin/tasks";
import Members from "@/pages/admin/members";
import Access from "@/pages/admin/access";
import Guests from "@/pages/admin/guests";
import Budget from "@/pages/admin/budget";
import Gifts from "@/pages/admin/gifts";
import Invitation from "@/pages/admin/invitation";

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
    <Route path="timeline" element={<RequireRoute resource="timeline" feature="timeline"><Timeline /></RequireRoute>} />
    <Route path="tasks" element={<RequireRoute resource="tasks" feature="tasks"><Tasks /></RequireRoute>} />
    <Route path="members" element={<RequireRoute feature="members"><Members /></RequireRoute>} />
    <Route path="access" element={<RequireRoute resource="access" feature="access"><Access /></RequireRoute>} />
    <Route path="guests" element={<RequireRoute resource="guests" feature="guests"><Guests /></RequireRoute>} />
    <Route path="budget" element={<RequireRoute requireSuperAdmin feature="budget"><Budget /></RequireRoute>} />
    <Route path="gifts" element={<RequireRoute requireSuperAdmin feature="gifts"><Gifts /></RequireRoute>} />
    <Route path="invitation" element={<RequireRoute resource="invitation" feature="invitation"><Invitation /></RequireRoute>} />
    <Route path="details" element={<Navigate to="../invitation" replace />} />
    <Route path="themes" element={<Navigate to="../invitation" replace />} />
    <Route path="*" element={<RedirectToTimeline />} />
  </Route>
);

export default AdminRoutes;
