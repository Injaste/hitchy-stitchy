import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarHeart, CalendarPlus, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, scaleIn, staggerContainer } from "./animations";
import { useUserEventsQuery } from "./queries";
import { EventCard } from "./EventCard";
import { supabase } from "@/lib/supabase";
import { useLogoutMutation } from "@/pages/auth/queries";
import Login from "../auth/AuthForm";

function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId, isLoading };
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      variants={scaleIn(0.1)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center text-center py-24 px-6"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <CalendarPlus className="w-9 h-9 text-primary" />
      </div>
      <h2 className="font-serif font-bold text-2xl text-foreground mb-2">
        No events yet
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        Your planning journey begins here. Create your first event and start
        building the day you've always imagined.
      </p>
      <Link to="/onboard">
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create your first event
        </Button>
      </Link>
    </motion.div>
  );
}

/* ─── Skeleton card ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="w-20 h-6 rounded-full bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4 mt-1" />
      </div>
      <div className="flex gap-2 mt-auto">
        <div className="flex-1 h-8 bg-muted rounded-lg" />
        <div className="w-20 h-8 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Dashboard page ─────────────────────────────────────────── */
export default function DashboardView() {
  const navigate = useNavigate();
  const { userId, isLoading: sessionLoading } = useSession();
  const { data: events, isLoading: eventsLoading } =
    useUserEventsQuery(!!userId);

  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation({
    onSuccess: () => navigate("/"),
  });

  if (!sessionLoading && !userId) return <Login />;

  const isLoading = sessionLoading || eventsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/8 blur-[60px]" />
      </div>

      {/* Topbar */}
      <motion.header
        variants={fadeUp(0)}
        initial="hidden"
        animate="show"
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60 px-6 md:px-10 py-4 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <CalendarHeart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-serif font-bold text-foreground text-base leading-none">
            Hitchy Stitchy
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/onboard">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New event
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground gap-1.5"
            onClick={() => logout(undefined as never)}
            disabled={isLoggingOut}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </motion.header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12">
        {/* Page title */}
        <motion.div
          variants={fadeUp(0.05)}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">
            Your events
          </p>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
            Planning Dashboard
          </h1>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}

            {/* Create new card */}
            <motion.div variants={fadeUp(0)}>
              <Link to="/onboard">
                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="h-full min-h-48 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 bg-transparent hover:bg-primary/3 transition-colors flex flex-col items-center justify-center gap-3 p-6 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-muted-foreground/30 group-hover:border-primary/40 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium text-center">
                    Plan another event
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
