import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarHeart, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp, scaleIn } from "@/pages/admin/animations";
import { useLoginMutation } from "./queries";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // No navigate needed — AuthGate listens for the auth:change event
  // dispatched by loginUser() and swaps to <AdminPage> automatically.
  const { mutate: login, isPending } = useLoginMutation({
    onError: (err) => {
      setError(err.message);
      setPassword("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login({ password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp(0)}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div variants={scaleIn(0.1)} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">Dan & Nad</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Wedding Admin
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp(0.15)}
          className="bg-card rounded-2xl border border-border shadow-sm p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              Enter your access password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Password"
                autoFocus
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive font-medium"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={!password || isPending}
              className="w-full"
            >
              {isPending ? "Checking..." : "Enter Planning Suite"}
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="hover:text-primary transition-colors">
            ← Back to invitation
          </a>
        </p>
      </motion.div>
    </div>
  );
}
