import { cn } from "@/lib/utils";
import type { AnchorClassNames, AnchorItemConfig } from "./types";

interface AnchorItemProps {
  item: AnchorItemConfig;
  classNames: AnchorClassNames;
  onAction?: (name: string) => void;
}

const AnchorItem = ({ item, classNames, onAction }: AnchorItemProps) => {
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (item.target.startsWith("action:")) {
      onAction?.(item.target.slice("action:".length));
      return;
    }

    const id = item.target.slice(1);
    const doc = (e.currentTarget.ownerDocument as Document | null) ?? document;
    const el = doc.getElementById(id);
    if (!el) return;

    const win = doc.defaultView ?? window;

    if ((item.scrollBlock ?? "center") === "start") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const viewportH = win.innerHeight;
    const scrollTop = win.scrollY;
    const docH = doc.documentElement.scrollHeight;

    const rect = el.getBoundingClientRect();
    const elCenter = scrollTop + rect.top + rect.height / 2;

    // Ideal: element centre sits at viewport centre
    const ideal = elCenter - viewportH / 2;

    // Clamp: can't scroll above 0, can't scroll past the bottom
    const maxScroll = docH - viewportH;
    const target = Math.round(Math.max(0, Math.min(ideal, maxScroll)));

    win.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-opacity hover:opacity-80 active:opacity-60",
        classNames.item,
      )}
    >
      <Icon className={cn("size-5", classNames.icon)} />
      <span
        className={cn(
          "text-3xs uppercase tracking-[0.2em]",
          classNames.label,
        )}
      >
        {item.label}
      </span>
    </button>
  );
};

export default AnchorItem;
