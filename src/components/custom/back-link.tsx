import { ArrowBigLeft } from "lucide-react";
import React, { type FC } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "../ui/button";
import type { VariantProps } from "class-variance-authority";

interface BackLinkProps {
  to: string;
  label: string;
  target?: React.HTMLAttributeAnchorTarget;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

const BackLink: FC<BackLinkProps> = ({
  to,
  label,
  target,
  variant = "ghost",
}) => {
  return (
    <Button variant={variant} asChild>
      <Link to={to} target={target} className="flex gap-2 text-xs">
        <ArrowBigLeft />
        {label}
      </Link>
    </Button>
  );
};

export default BackLink;
