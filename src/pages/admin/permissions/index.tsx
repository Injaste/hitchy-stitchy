import { usePermissionsQuery } from "./queries";
import PermissionsHeader from "./components/PermissionsHeader";
import PermissionsView from "./components/PermissionsView";
import Container from "@/components/custom/container";

const Permissions = () => {
  const { data, isLoading, isError } = usePermissionsQuery();

  return (
    <Container>
      <PermissionsHeader />
      <PermissionsView data={data} isLoading={isLoading} isError={isError} />
    </Container>
  );
};

export default Permissions;
