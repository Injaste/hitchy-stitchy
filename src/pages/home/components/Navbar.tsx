import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Logo from "@/components/custom/logo";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/80 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <Link to="/" className="flex items-center gap-2.5 group">
        <Logo imageClassName="w-8 h-8" brandClassName="text-lg font-bold" showName direction="row" />
      </Link>

      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Start planning</Button>
        </Link>
      </div>
    </motion.nav>
  );
}
