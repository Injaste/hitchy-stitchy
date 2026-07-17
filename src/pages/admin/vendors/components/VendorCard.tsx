import type { FC } from "react";
import { Mail, Phone, PhoneCall, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/custom/brand-icons";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { cn } from "@/lib/utils";
import { formatPhone, whatsAppHref } from "@/lib/phone";

import { categoryMeta } from "../utils";
import type { Vendor } from "../types";

interface VendorCardProps {
  vendor: Vendor;
  /** Card body click — opens the vendor's detail. */
  onOpen: (vendor: Vendor) => void;
}

/** One contact row. Always renders its icon — a missing value reads as a dimmed
 *  em-dash rather than vanishing, so every card keeps the same two rows and the
 *  grid doesn't ripple as vendors gain or lose details. */
const ContactLine: FC<{ icon: LucideIcon; value: string }> = ({
  icon: Icon,
  value,
}) => (
  <p
    className={cn(
      "flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground",
      !value && "opacity-50",
    )}
  >
    <Icon className="size-3.5 shrink-0" />
    <span className="truncate">{value || "—"}</span>
  </p>
);

// Compact contact card (mirrors InvitationCard's geometry: icon bubble + badge
// header, then title/details, then an action row). The category icon is the
// vendor's identity mark and the badge spells it out — icon to glance, label to
// read. No per-category colour: a tone would imply meaning the data doesn't
// carry (same call gifts made for its methods). Tokens only.
const VendorCard: FC<VendorCardProps> = ({ vendor, onOpen }) => {
  const category = categoryMeta(vendor.category);
  const CategoryIcon = category.icon;

  const phoneHref = vendor.contact_phone?.replace(/\s+/g, "");
  const waHref = whatsAppHref({ type: "chat", phone: vendor.contact_phone });
  const hasContact = !!(vendor.contact_phone || vendor.contact_email);

  return (
    // h-full + the mt-auto action row below: cards in a grid row stretch to the
    // tallest, and the buttons stay on one line across all of them however much
    // contact/notes each vendor has.
    <Card
      variant="interactive"
      className="group/vendor-card relative h-full"
    >
      {/* Whole-card hit target as a real button — keyboard focusable and
          labelled, unlike an onClick on the Card div. It paints over the static
          content (positioned, z-0), so anything that needs its own click has to
          out-stack it — see the action row's z-10 below. */}
      <button
        onClick={() => onOpen(vendor)}
        aria-label={vendor.name}
        data-card-hit
        className="absolute inset-0 z-0 cursor-pointer rounded-[inherit]"
      />

      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover/vendor-card:bg-primary/15">
          <CategoryIcon className="h-5 w-5 text-primary" />
        </div>
        <Badge variant="secondary">{category.label}</Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-4">
        <h3 className="mb-1 truncate font-display text-xl leading-snug font-bold text-foreground">
          {vendor.name}
        </h3>

        <div className="space-y-0.5">
          <ContactLine icon={Phone} value={formatPhone(vendor.contact_phone)} />
          <ContactLine icon={Mail} value={vendor.contact_email ?? ""} />
        </div>

        {vendor.notes && (
          <CardDescription className="mt-2 line-clamp-2">
            <NotesMarkdown content={vendor.notes} size="sm" />
          </CardDescription>
        )}

        {/* Reach-them actions only — the card itself opens the vendor, so an
            Edit button would just duplicate that. Hidden outright when there's
            nothing to reach.
            z-10 lifts the row above the whole-card button so these take their
            own clicks (no stopPropagation needed — the button is a sibling, not
            an ancestor). Each hands off to another app, so they open in a new
            tab and the admin never navigates away mid-edit. */}
        {hasContact && (
          <div className="relative z-10 mt-auto flex items-center gap-2 pt-4">
            {waHref && (
              <Button size="icon" variant="outline" asChild>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${vendor.name}`}
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              </Button>
            )}
            {phoneHref && (
              <Button size="icon" variant="outline" asChild>
                <a
                  href={`tel:${phoneHref}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Call ${vendor.name}`}
                >
                  <PhoneCall />
                </a>
              </Button>
            )}
            {vendor.contact_email && (
              <Button size="icon" variant="outline" asChild>
                <a
                  href={`mailto:${vendor.contact_email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Email ${vendor.name}`}
                >
                  <Mail />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorCard;
