import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarHeart,
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp, scaleIn } from "@/pages/admin/animations";
import { useSignupMutation } from "./queries";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  const { mutate: signup, isPending } = useSignupMutation({
    onSuccess: () => setSucceeded(true),
    onError: (err) => {
      setError(err.message);
      setPassword("");
      setConfirmPassword("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    signup({ fullName, email, password });
  };

  if (succeeded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Account created!
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              We've sent a confirmation link to{" "}
              <span className="text-foreground font-medium">{email}</span>.
              Check your inbox to activate your account.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Link
                to="/"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div
          variants={scaleIn(0.1)}
          initial="hidden"
          animate="show"
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">
            Hitchy Stitchy
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Wedding Planning Suite
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp(0.15)}
          initial="hidden"
          animate="show"
          className="bg-card rounded-2xl border border-border shadow-sm p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              Create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Full name"
              autoFocus
              autoComplete="name"
            />

            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="Email"
              autoComplete="email"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Password"
                className="pr-12"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Confirm password"
                className="pr-12"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
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
              disabled={
                !fullName ||
                !email ||
                !password ||
                !confirmPassword ||
                isPending
              }
              className="w-full"
            >
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </motion.div>

        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="show"
          className="text-center mt-6 space-y-2"
        >
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/dashboard"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
