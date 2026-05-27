import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  brandClassName?: string;
  taglineClassName?: string;
  showBrand?: boolean;
  showTagline?: boolean;
  direction?: "row" | "col";
  textAlign?: "left" | "center";
}

const Logo = ({
  className,
  imageClassName,
  brandClassName,
  taglineClassName,
  showBrand: showName = false,
  showTagline = false,
  direction = "col",
  textAlign = "center",
}: LogoProps) => (
  <div
    className={cn(
      "flex items-center",
      direction === "col" ? "flex-col gap-2" : "flex-row gap-2.5",
      className,
    )}
  >
    <img
      src="/images/unique-muslim/dannad.png"
      alt="Hitchy Stitchy"
      className={cn("object-contain", imageClassName)}
    />
    {showName && (
      <div className={cn("flex flex-col", textAlign === "left" ? "text-left" : "text-center")}>
        <span
          className={cn(
            "font-display font-semibold text-foreground tracking-wide",
            brandClassName,
          )}
        >
          Hitchy Stitchy
        </span>
        {showTagline && (
          <span
            className={cn(
              "text-xs uppercase tracking-widest text-muted-foreground mt-0.5",
              taglineClassName,
            )}
          >
            A Wedding Planning Suite
          </span>
        )}
      </div>
    )}
  </div>
);

export default Logo;
