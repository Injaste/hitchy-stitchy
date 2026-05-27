import { cn } from "@/lib/utils";
import { type FC, type ReactNode } from "react";

const sizeMap = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  default: "max-w-6xl",
  lg: "max-w-6xl",
  full: "max-w-full",
  none: "max-w-none",
} as const;

type ContainerSize = keyof typeof sizeMap;

interface ContainerProps {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
  centred?: boolean;
  pageSpacing?: boolean;
}

const Container: FC<ContainerProps> = ({
  size = "default",
  className,
  children,
  centred = true,
  pageSpacing = false,
}) => {
  return (
    <div
      className={cn(
        "w-full transition-[max-width]",
        sizeMap[size],
        centred && "mx-auto",
        pageSpacing && "mt-4 sm:mt-8",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
