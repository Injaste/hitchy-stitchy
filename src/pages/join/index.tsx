import { useEffect } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { motion } from "framer-motion";

import Logo from "@/components/custom/logo";
import { Button } from "@/components/ui/button";
import BackLink from "@/components/custom/back-link";
import LoadingState from "@/components/custom/states/loading-state";
import ComponentFade from "@/components/animations/animate-component-fade";

import { useAuthListener, useIsAuthenticatedQuery } from "@/auth/queries";
import { useClaimInviteQuery } from "./queries";

// Small centered message card matching the auth pages' surface.
const JoinMessage = ({
  title,
  body,
  showDashboard = false,
}: {
  title: string;
  body: string;
  showDashboard?: boolean;
}) => (
  <div className="min-h-screen bg-gradient-surface">
    <ComponentFade
      useBlur
      className="flex min-h-screen items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        <Logo className="mb-4" imageClassName="w-24 h-24 -mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {body}
        </p>
        {showDashboard && (
          <Link to="/dashboard">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        )}
        <div className="mt-3">
          <BackLink to="/" label="Back to Home" />
        </div>
      </motion.div>
    </ComponentFade>
  </div>
);

const Join = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useAuthListener();
  const { data: isAuthenticated, isLoading } = useIsAuthenticatedQuery();
  // Token-keyed query: claims once, cached across remounts (see queries.ts).
  const claim = useClaimInviteQuery(token, Boolean(isAuthenticated));

  // On a successful claim, land in the event. Kept in an effect (not the query)
  // so the redirect survives the route transition re-mounting this page.
  useEffect(() => {
    if (claim.data) navigate(`/${claim.data}/admin`, { replace: true });
  }, [claim.data, navigate]);

  if (!token) {
    return (
      <JoinMessage
        title="Invalid invite link"
        body="This link is missing its invite token. Ask whoever invited you to resend it."
      />
    );
  }

  // A finished claim is terminal — show its outcome before any auth check.
  // Checking this first is what prevents a login ⇄ join redirect loop: a failed
  // claim (e.g. a bad/expired token) must surface its message, not fall through
  // to the bounce below and ping-pong with login's own authenticated-redirect.
  if (claim.isError) {
    return (
      <JoinMessage
        title="Couldn't join"
        body={claim.error?.message ?? "This invite can't be used."}
        showDashboard
      />
    );
  }

  if (isLoading) return <LoadingState />;

  // Not signed in — route to login (the join URL is the post-auth destination).
  // Signups are disabled for beta, so invites work for existing accounts; a
  // brand-new invitee can't self-register yet (documented follow-up).
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`/${slug}/join?token=${token}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Authenticated and claiming — brief loading until the redirect fires.
  return <LoadingState />;
};

export default Join;
