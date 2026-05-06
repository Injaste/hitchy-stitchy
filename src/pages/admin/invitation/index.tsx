import { useEffect } from "react";
import { useInvitationQuery, useThemesQuery } from "./queries";
import { useInvitationStore } from "./store/useInvitationStore";
import { useInvitationModalStore } from "./store/useInvitationModalStore";
import InvitationHeader from "./components/InvitationHeader";
import InvitationView from "./components/InvitationView";
import ThemeModals from "./themes/modals";
import Container from "@/components/custom/container";

const Invitation = () => {
  const invitationQuery = useInvitationQuery();
  const themesQuery = useThemesQuery();

  const setSelectedThemeId = useInvitationStore((s) => s.setSelectedThemeId);
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId);

  useEffect(() => {
    if (!themesQuery.data) return;
    if (
      selectedThemeId &&
      themesQuery.data.some((t) => t.id === selectedThemeId)
    )
      return;
    const published = themesQuery.data.find((t) => t.is_published);
    setSelectedThemeId(published?.id ?? themesQuery.data[0]?.id ?? null);
  }, [themesQuery.data]);

  const isLoading = invitationQuery.isLoading || themesQuery.isLoading;
  const isError = invitationQuery.isError || themesQuery.isError;
  const isRefetching = invitationQuery.isRefetching || themesQuery.isRefetching;
  const refetch = () => {
    invitationQuery.refetch();
    themesQuery.refetch();
  };

  return (
    <Container className="space-y-8">
      <InvitationHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <InvitationView
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <ThemeModals />
    </Container>
  );
};

export default Invitation;
