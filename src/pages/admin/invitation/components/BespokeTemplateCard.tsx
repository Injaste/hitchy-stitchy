import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBespokeModalStore } from "../hooks/useBespokeModalStore";
import { BESPOKE_TITLE, BESPOKE_BLURB, bespokeSurface } from "./bespoke";

// The bespoke escape hatch in the browse sheet — same layout as TemplateCard
// (left thumbnail, title + blurb, trailing affordance) but on the gradient add-on
// surface instead of a white card. Opens the brief modal. Super-admin-only (gated
// by BrowsePanel).
const BespokeTemplateCard = () => {
  const { open } = useBespokeModalStore();

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "group/bespoke w-full text-left flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors hover:border-primary/50",
        bespokeSurface,
      )}
    >
      <div className="size-12 shrink-0 rounded-md bg-primary/10 grid place-items-center text-primary">
        <Sparkles className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium font-display truncate">
          {BESPOKE_TITLE}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {BESPOKE_BLURB}
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/bespoke:translate-x-0.5" />
    </button>
  );
};

export default BespokeTemplateCard;
