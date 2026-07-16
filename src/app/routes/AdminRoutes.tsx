import { lazy } from "react";
import { Route, Navigate, useParams } from "react-router-dom";
import RequireRoute from "@/components/custom/require-route";
// MOCKUP: vendors is guarded by RequireAccess alone (super-admin), skipping the
// plan gate — it has no plan feature/resource yet. Swap to RequireRoute when the
// backend + entitlements land (see docs/todo/mvp-phase-6-vendor-management.md).
import RequireAccess from "@/components/custom/require-access";
import ComponentFade from "@/components/animations/animate-component-fade";
import { usePlan } from "@/pages/admin/hooks/usePlan";
import { useAccess } from "@/pages/admin/hooks/useAccess";
import { useSetupGuide } from "@/pages/admin/setup-guide/hooks/useSetupGuide";
import type { PlanFeature } from "@/pages/admin/plan/plan-config";

import Timeline from "@/pages/admin/timeline";
import Tasks from "@/pages/admin/tasks";
import Members from "@/pages/admin/members";
import Access from "@/pages/admin/access";
import Guests from "@/pages/admin/guests";
import Budget from "@/pages/admin/budget";
import Gifts from "@/pages/admin/gifts";
import Vendors from "@/pages/admin/vendors";
import Invitation from "@/pages/admin/invitation";

const Admin = lazy(() => import("@/pages/admin"));

// Absolute redirect built from the slug. A relative `<Navigate to="...">`
// resolves by appending to the current URL inside a splat (`*`) route, which
// turns an unknown sub-path into an infinite /…/… loop.
//
// Lands on the first page the PLAN enables AND the member can access, in priority
// order — so Starter/Plus (timeline etc. locked) open on Guests, and Pro/Advanced
// open on Timeline, with no per-tier hardcoding. Renders inside the admin outlet,
// which only mounts once bootstrap is ready, so plan/access are populated.
const RedirectToLanding = () => {
  const { slug } = useParams();
  const { canUseFeature } = usePlan();
  const { canRead, isSuperAdmin } = useAccess();
  const { active, nextRoute } = useSetupGuide();

  // While the couple is still setting up (super-admin + a routable step left), land
  // on the next thing to do. Falls through to the standard priority list once setup
  // is complete, and never applies for collaborators. nextRoute skips the days step
  // (it opens a settings modal, not a page).
  if (active && nextRoute) {
    return <Navigate to={`/${slug}/admin/${nextRoute}`} replace />;
  }

  const landing: { path: string; feature: PlanFeature; allowed: boolean }[] = [
    { path: "timeline", feature: "timeline", allowed: canRead("timeline") },
    { path: "guests", feature: "guests", allowed: canRead("guests") },
    { path: "invitation", feature: "invitation", allowed: canRead("invitation") },
    { path: "tasks", feature: "tasks", allowed: canRead("tasks") },
    { path: "access", feature: "access", allowed: canRead("access") },
    { path: "budget", feature: "budget", allowed: isSuperAdmin },
    { path: "gifts", feature: "gifts", allowed: isSuperAdmin },
  ];
  const target =
    landing.find((r) => canUseFeature(r.feature) && r.allowed)?.path ??
    "invitation";

  return <Navigate to={`/${slug}/admin/${target}`} replace />;
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
    <Route index element={<RedirectToLanding />} />
    <Route path="timeline" element={<RequireRoute resource="timeline" feature="timeline"><Timeline /></RequireRoute>} />
    <Route path="tasks" element={<RequireRoute resource="tasks" feature="tasks"><Tasks /></RequireRoute>} />
    <Route path="members" element={<RequireRoute feature="members"><Members /></RequireRoute>} />
    <Route path="access" element={<RequireRoute resource="access" feature="access"><Access /></RequireRoute>} />
    <Route path="guests" element={<RequireRoute resource="guests" feature="guests"><Guests /></RequireRoute>} />
    <Route path="budget" element={<RequireRoute requireSuperAdmin feature="budget"><Budget /></RequireRoute>} />
    <Route path="gifts" element={<RequireRoute requireSuperAdmin feature="gifts"><Gifts /></RequireRoute>} />
    <Route path="vendors" element={<RequireAccess requireSuperAdmin><Vendors /></RequireAccess>} />
    <Route path="invitation" element={<RequireRoute resource="invitation" feature="invitation"><Invitation /></RequireRoute>} />
    <Route path="details" element={<Navigate to="../invitation" replace />} />
    <Route path="themes" element={<Navigate to="../invitation" replace />} />
    <Route path="*" element={<RedirectToLanding />} />
  </Route>
);

export default AdminRoutes;
