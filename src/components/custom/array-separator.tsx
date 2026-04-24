import { cn } from "@/lib/utils";
import React, { type FC } from "react";

interface ArraySeparatorProps {
  items: (string | number | React.ReactNode)[];
  separator?: React.ReactNode;
  className?: string;
}

const ArraySeparator: FC<ArraySeparatorProps> = ({
  items,
  separator = <span className="text-muted-foreground/70">•</span>,
  className,
}) => {
  const validItems = items.filter((item) => item === 0 || !!item);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {validItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && separator}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ArraySeparator;
