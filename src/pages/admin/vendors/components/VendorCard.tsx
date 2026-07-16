import type { FC } from "react";
import { Mail, Pencil, Phone, PhoneCall } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/custom/brand-icons";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { formatPhone, whatsAppHref } from "@/lib/phone";

import { categoryMeta } from "../utils";
import type { Vendor } from "../types";

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
}

// Compact contact card (mirrors InvitationCard's geometry: icon bubble + badge
// header, then title/details, then an action row). The category icon is the
// vendor's identity mark and the badge spells it out — icon to glance, label to
// read. No per-category colour: a tone would imply meaning the data doesn't
// carry (same call gifts made for its methods). Tokens only.
const VendorCard: FC<VendorCardProps> = ({ vendor, onEdit }) => {
  const category = categoryMeta(vendor.category);
  const CategoryIcon = category.icon;

  const phoneHref = vendor.contact_phone?.replace(/\s+/g, "");
  const waHref = whatsAppHref({ type: "chat", phone: vendor.contact_phone });

  return (
    // h-full + the mt-auto action row below: cards in a grid row stretch to the
    // tallest, and the buttons stay on one line across all of them however much
    // contact/notes each vendor has.
    <Card
      variant="interactive"
      onClick={() => onEdit(vendor)}
      className="group/vendor-card h-full cursor-pointer"
    >
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
          {vendor.contact_phone && (
            <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              <span className="truncate">{formatPhone(vendor.contact_phone)}</span>
            </p>
          )}
          {vendor.contact_email && (
            <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{vendor.contact_email}</span>
            </p>
          )}
          {!vendor.contact_phone && !vendor.contact_email && (
            <p className="text-sm text-muted-foreground/60">No contact details</p>
          )}
        </div>

        {vendor.notes && (
          <div className="mt-2">
            <NotesMarkdown content={vendor.notes} size="sm" />
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(vendor)}
            className="flex-1 gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>

          {waHref && (
            <Button
              size="icon"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
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
            <Button
              size="icon"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={`tel:${phoneHref}`} aria-label={`Call ${vendor.name}`}>
                <PhoneCall />
              </a>
            </Button>
          )}
          {vendor.contact_email && (
            <Button
              size="icon"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={`mailto:${vendor.contact_email}`}
                aria-label={`Email ${vendor.name}`}
              >
                <Mail />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
