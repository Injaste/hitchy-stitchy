import { useAccessGroupsQuery, useAvailableResourcesQuery } from "./queries";
import AccessHeader from "./components/AccessHeader";
import AccessView from "./components/AccessView";
import AccessModals from "./modals";
import Container from "@/components/custom/container";

const Access = () => {
  const { data: accessGroups, isLoading: accessGroupsLoading, isError: accessGroupsError, isRefetching, refetch } = useAccessGroupsQuery();
  const { data: availableResources = [], isLoading: resourcesLoading, isError: resourcesError } = useAvailableResourcesQuery();

  const isLoading = accessGroupsLoading || resourcesLoading;
  const isError = accessGroupsError || resourcesError;

  return (
    <>
      <AccessHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing>
        <AccessView
          data={accessGroups}
          availableResources={availableResources}
          isLoading={isLoading}
          isError={isError}
        />
      </Container>
      <AccessModals />
    </>
  );
};

export default Access;
