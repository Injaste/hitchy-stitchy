import type { FC } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";

interface InvitationHeaderProps extends BaseHeaderProps {}

const InvitationHeader: FC<InvitationHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { slug } = useAdminStore();

  return (
    <AdminPageHeader
      title="Invitation"
      description="Design and configure your wedding RSVP page. Choose a theme, customise the look, and control how guests respond."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      action={
        slug && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/${slug}`} target="_blank" className="gap-0">
              <ActionLabel side="right">Open live page</ActionLabel>
              <ExternalLink />
            </Link>
          </Button>
        )
      }
    />
  );
};

export default InvitationHeader;
