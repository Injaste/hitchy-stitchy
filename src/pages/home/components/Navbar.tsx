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
      className="fixed top-0 left-0 right-0 z-50"
      aria-label="Main navigation"
    >
      <div className="relative flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-md">
        <div className="absolute inset-0 bg-background/80 -z-1" />
        <div className="absolute left-0 right-0 top-full h-4 bg-linear-to-b from-background/80 to-transparent pointer-events-none" />

        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo
            imageClassName="w-12 h-12 -mb-3"
            brandClassName="text-lg font-bold"
            showBrand
            direction="row"
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* <Link to="/signup">
            <Button size="sm">Start planning</Button>
          </Link> */}
          <a href="#get-started">
            <Button size="sm">Subscribe Now</Button>
          </a>
          <Link to="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
