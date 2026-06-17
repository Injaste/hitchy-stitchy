import { cn } from "@/lib/utils";
import type { PublicEventConfig } from "@/pages/wedding/types";
import type { EventInvitation } from "../types";
import type { InvitationSheetMode } from "../hooks/useInvitationModalStore";
import InvitationPreviewFrame from "./InvitationPreviewFrame";
import EditSheetPreview from "./EditSheetPreview";
import PhonePreview from "./PhonePreview";

const DOT_BG: React.CSSProperties = {
  backgroundImage: `
    radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0),
    radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0)
  `,
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 4px 4px",
};

interface InvitationPreviewPaneProps {
  mode: InvitationSheetMode;
  templatePreview: PublicEventConfig | null;
  editInvitation: EventInvitation | null;
  // Defers the edit preview's iframe load until the host has settled (sheet
  // enter animation on desktop, slide-over enter on small screens).
  entered: boolean;
  className?: string;
}

// The dotted preview surface, shared by the inline (md+) column and the
// small-screen slide-over. Browse → a template preview; edit → the live draft.
const InvitationPreviewPane = ({
  mode,
  templatePreview,
  editInvitation,
  entered,
  className,
}: InvitationPreviewPaneProps) => (
  <div
    className={cn("relative h-full overflow-hidden", className)}
    style={DOT_BG}
  >
    {mode === "browse" ? (
      <div className="flex h-full flex-col items-center justify-center p-6 max-sm:px-2">
        {templatePreview && (
          <PhonePreview>
            <InvitationPreviewFrame config={templatePreview} />
          </PhonePreview>
        )}
      </div>
    ) : editInvitation ? (
      <EditSheetPreview invitation={editInvitation} entered={entered} />
    ) : null}
  </div>
);

export default InvitationPreviewPane;
