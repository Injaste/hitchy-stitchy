import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  brandClassName?: string;
  showName?: boolean;
  direction?: "row" | "col";
}

const Logo = ({
  className,
  imageClassName,
  brandClassName,
  showName = false,
  direction = "col",
}: LogoProps) => (
  <div
    className={cn(
      "flex items-center",
      direction === "col" ? "flex-col gap-2" : "flex-row gap-2.5",
      className,
    )}
  >
    <img
      src="/dannad.png"
      alt="Hitchy Stitchy"
      className={cn("object-contain", imageClassName)}
    />
    {showName && (
      <span
        className={cn(
          "font-display font-semibold text-foreground tracking-wide",
          brandClassName,
        )}
      >
        Hitchy Stitchy
      </span>
    )}
  </div>
);

export default Logo;
