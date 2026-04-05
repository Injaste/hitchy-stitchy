import { cn } from "@/lib/utils";
import { type FC, type ReactNode } from "react";

interface ChildrenProps {
  size?: "default";
  className?: string;
  children: ReactNode;
}

const Container: FC<ChildrenProps> = ({
  size = "default",
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "w-full",
        size === "default" && "max-w-5xl mx-auto",
        size === "default" && "max-w-5xl mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
