import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/custom/logo";
import ShareRow from "./ShareRow";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-16 py-16">

      {/* Top */}
      <div className="flex flex-col sm:flex-row gap-12">
        {/* Logo block */}
        <div className="flex flex-col items-start gap-5 shrink-0 w-64">
          <Logo
            imageClassName="w-16 h-16 -mb-4"
            brandClassName="text-lg"
            showBrand
            showTagline
            direction="row"
            textAlign="left"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            The simplest way to plan your wedding and manage your guests.
          </p>
          <ShareRow />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav columns */}
        <div className="flex flex-row gap-12 text-sm shrink-0">
          <div className="flex flex-col gap-3">
            <span className="font-medium text-foreground">Product</span>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-medium text-foreground">Terms</span>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hitchy Stitchy. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:izhandanish@hitchystitchy.com"
            className="underline hover:text-foreground transition-colors"
          >
            izhandanish@hitchystitchy.com
          </a>
        </p>
        <a href="#get-started">
          <Button size="sm">Subscribe Now</Button>
        </a>
      </div>

    </footer>
  );
}
