import { Link } from "react-router-dom";
import { CalendarHeart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <CalendarHeart className="w-4 h-4 text-primary" />
        <span className="font-serif font-semibold text-foreground text-sm">Hitchy Stitchy</span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Crafted with love for couples who care about every detail.
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Link to="/signup" className="hover:text-primary transition-colors">Sign up</Link>
        <Link to="/dashboard" className="hover:text-primary transition-colors">Sign in</Link>
      </div>
    </footer>
  );
}
