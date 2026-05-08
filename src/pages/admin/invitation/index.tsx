import { useEffect } from "react";
import { useInvitationQuery, useThemesQuery } from "./queries";
import { useInvitationStore } from "./store/useInvitationStore";
import InvitationHeader from "./components/InvitationHeader";
import InvitationView from "./components/InvitationView";
import ThemeModals from "./themes/modals";
import Container from "@/components/custom/container";

const Invitation = () => {
  const invitationQuery = useInvitationQuery();
  const themesQuery = useThemesQuery();

  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId);
  const setSelectedThemeId = useInvitationStore((s) => s.setSelectedThemeId);
  const setTheme = useInvitationStore((s) => s.setTheme);

  useEffect(() => {
    if (!themesQuery.data) return;
    if (
      selectedThemeId &&
      themesQuery.data.some((t) => t.id === selectedThemeId)
    )
      return;
    const published = themesQuery.data.find((t) => t.is_published);
    if (!published) return;

    setSelectedThemeId(themesQuery.data[0].id);
    setTheme(themesQuery.data[0].config);
  }, [themesQuery.data]);

  const isLoading = invitationQuery.isLoading || themesQuery.isLoading;
  const isError = invitationQuery.isError || themesQuery.isError;
  const isRefetching = invitationQuery.isRefetching || themesQuery.isRefetching;
  const refetch = () => {
    invitationQuery.refetch();
    themesQuery.refetch();
  };

  return (
    <Container>
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
