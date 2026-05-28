import type { FC } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { Button } from "@/components/ui/button";
import {
  ActionLabel,
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

interface InvitationHeaderProps extends BaseHeaderProps {}

const InvitationHeader: FC<InvitationHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { slug } = useAdminStore();

  return (
    <PageHeader
      title="Invitation"
      description="Design and configure your wedding RSVP page. Choose a theme, customise the look, and control how guests respond."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      action={
        slug && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/${slug}`} target="_blank" className="gap-1">
              <ActionLabel>Open live page</ActionLabel>
              <ExternalLink />
            </Link>
          </Button>
        )
      }
    />
  );
};

export default InvitationHeader;
