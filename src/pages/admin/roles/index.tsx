import { useRolesQuery, useAvailableResourcesQuery } from "./queries";
import RolesHeader from "./components/RolesHeader";
import RolesView from "./components/RolesView";
import RolesModals from "./modals";
import Container from "@/components/custom/container";

const Roles = () => {
  const { data: roles, isLoading: rolesLoading, isError: rolesError, isRefetching, refetch } = useRolesQuery();
  const { data: availableResources = [], isLoading: resourcesLoading, isError: resourcesError } = useAvailableResourcesQuery();

  const isLoading = rolesLoading || resourcesLoading;
  const isError = rolesError || resourcesError;

  return (
    <>
      <RolesHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing>
        <RolesView
          data={roles}
          availableResources={availableResources}
          isLoading={isLoading}
          isError={isError}
        />
      </Container>
      <RolesModals />
    </>
  );
};

export default Roles;
