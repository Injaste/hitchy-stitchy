import { cn } from "@/lib/utils";
import { type FC, type ReactNode } from "react";

interface ChildrenProps {
  size?: "default";
  className?: string;
  children: ReactNode;
  centred?: boolean;
}

const Container: FC<ChildrenProps> = ({
  size = "default",
  className,
  children,
  centred = true,
}) => {
  return (
    <div
      className={cn(
        "w-full",
        size === "default" && "max-w-5xl",
        size === "default" && "max-w-5xl",
        centred && "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
