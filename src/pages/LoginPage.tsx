import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarHeart, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const success = login(password);
      if (success) {
        navigate("/admin");
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f1] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-50 border border-gold-200 mb-4">
            <CalendarHeart className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gold-600">Dan & Nad</h1>
          <p className="text-xs uppercase tracking-widest text-sage-500 mt-1">Wedding Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-sage-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-sage-400" />
            <p className="text-sm text-sage-600 font-medium">Enter your access password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 pr-12 rounded-xl border border-sage-200 bg-sage-50/50 text-sage-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all placeholder:text-sage-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all active:scale-95"
            >
              {loading ? "Checking..." : "Enter Planning Suite"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-sage-400 mt-6">
          <a href="/" className="hover:text-gold-500 transition-colors">← Back to invitation</a>
        </p>
      </motion.div>
    </div>
  );
}
