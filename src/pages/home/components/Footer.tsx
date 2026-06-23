import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Logo from "@/components/custom/logo";
import ShareRow from "./ShareRow";

const NAV = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Get early access", href: "#get-started" },
  ],
  Company: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Login", to: "/login" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Columns */}
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-start gap-5 max-w-xs">
            <Logo
              imageClassName="w-14 h-14 -mb-3"
              brandClassName="text-lg"
              showBrand
              showTagline
              direction="row"
              textAlign="left"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              The simplest way to plan your wedding and manage your guests — from
              the first RSVP to the last dance.
            </p>
            <ShareRow />
          </div>

          {/* Nav columns */}
          <nav className="flex flex-col gap-3.5 text-sm">
            <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Product
            </span>
            {NAV.Product.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <nav className="flex flex-col gap-3.5 text-sm">
            <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Company
            </span>
            {NAV.Company.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="mailto:izhandanish@hitchystitchy.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hitchy Stitchy. All rights reserved.
          </p>
          <a
            href="mailto:izhandanish@hitchystitchy.com"
            className="group inline-flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-primary/30 transition-colors"
          >
            <span className="flex items-center justify-center rounded-md bg-primary/10 p-1 text-primary transition-colors group-hover:bg-primary/15">
              <Mail className="w-3.5 h-3.5" />
            </span>
            <span className="font-medium">Get in touch</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
