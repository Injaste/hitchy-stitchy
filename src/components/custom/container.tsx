import { cn } from "@/lib/utils";
import { type FC, type ReactNode } from "react";

const sizeMap = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  default: "max-w-5xl",
  lg: "max-w-6xl",
  full: "max-w-full",
} as const;

type ContainerSize = keyof typeof sizeMap;

interface ContainerProps {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
  centred?: boolean;
}

const Container: FC<ContainerProps> = ({
  size = "default",
  className,
  children,
  centred = true,
}) => {
  return (
    <div
      className={cn(
        "w-full",
        sizeMap[size],
        centred && "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
