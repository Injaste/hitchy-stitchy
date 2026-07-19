import type { FC } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, History, Mail, Phone, PhoneCall, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { WhatsAppIcon } from "@/components/custom/brand-icons";
import { cn } from "@/lib/utils";
import { formatPhone, whatsAppHref } from "@/lib/phone";

import { useAccess } from "../../hooks/useAccess";
import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { categoryMeta } from "../utils";
import VendorDays from "../components/VendorDays";

/** A contact line plus the ways to use it. Mirrors the card: the icon always
 *  renders, and a missing value reads as a dimmed em-dash. */
const ContactRow: FC<{
  icon: LucideIcon;
  value: string;
  children?: React.ReactNode;
}> = ({ icon: Icon, value, children }) => (
  <div className="flex min-w-0 items-center justify-between gap-2">
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground",
        !value && "opacity-50",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value || "—"}</span>
    </span>
    {value && <span className="flex shrink-0 items-center gap-1">{children}</span>}
  </div>
);

// Vendor detail — the read view the card opens onto; Edit/Delete hang off it via
// DialogDetailActions, the same shape MemberDetailModal uses.
//
// History shows *when* it was added, never *who* — event_vendors carries no
// created_by column (see the vendors:full delegation note in the todo doc).
const VendorDetailModal = () => {
  const isDetailOpen = useVendorModalStore((s) => s.isDetailOpen);
  const selectedItem = useVendorModalStore((s) => s.selectedItem);
  const closeAll = useVendorModalStore((s) => s.closeAll);
  const openEdit = useVendorModalStore((s) => s.openEdit);
  const openDelete = useVendorModalStore((s) => s.openDelete);
  const { canEdit } = useAccess();

  if (!selectedItem) return null;

  const vendor = selectedItem;
  const category = categoryMeta(vendor.category);
  const CategoryIcon = category.icon;

  const phone = formatPhone(vendor.phone);
  const phoneHref = vendor.phone?.replace(/\s+/g, "");
  const waHref = whatsAppHref({ type: "chat", phone: vendor.phone });

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CategoryIcon className="size-5 text-primary" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle className="truncate">{vendor.name}</DialogTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{category.label}</Badge>
                <VendorDays dayIds={vendor.day_ids} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <NotesMarkdown content={vendor.notes} />

            <div className="space-y-1.5">
              <ContactRow icon={Phone} value={phone}>
                {waHref && (
                  <Button variant="ghost" size="icon-xs" asChild>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${vendor.name}`}
                    >
                      <WhatsAppIcon className="size-3.5" />
                    </a>
                  </Button>
                )}
                {phoneHref && (
                  <Button variant="ghost" size="icon-xs" asChild>
                    <a
                      href={`tel:${phoneHref}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Call ${vendor.name}`}
                    >
                      <PhoneCall className="size-3.5" />
                    </a>
                  </Button>
                )}
              </ContactRow>

              <ContactRow icon={Mail} value={vendor.email ?? ""}>
                <Button variant="ghost" size="icon-xs" asChild>
                  <a
                    href={`mailto:${vendor.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Email ${vendor.name}`}
                  >
                    <Mail className="size-3.5" />
                  </a>
                </Button>
              </ContactRow>
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <History className="size-3 shrink-0" />
                History
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Added</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {format(parseISO(vendor.created_at), "d MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </DialogBody>

        {canEdit("vendors") && (
          <DialogDetailActions
            destructive={[{ label: "Delete", onClick: openDelete }]}
            primary={{ label: "Edit", onClick: openEdit }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailModal;
