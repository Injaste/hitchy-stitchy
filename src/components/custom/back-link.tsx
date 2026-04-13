import { ArrowBigLeft } from "lucide-react";
import React, { type FC } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface BackLinkProps {
  to: string;
  label: string;
  target?: React.HTMLAttributeAnchorTarget;
}

const BackLink: FC<BackLinkProps> = ({ to, label, target }) => {
  return (
    <Button variant="ghost" asChild>
      <Link to={to} target={target} className="flex gap-2 text-xs">
        <ArrowBigLeft />
        {label}
      </Link>
    </Button>
  );
};

export default BackLink;
