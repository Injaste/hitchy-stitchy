import { usePermissionsQuery } from "./queries";
import PermissionsHeader from "./components/PermissionsHeader";
import PermissionsView from "./components/PermissionsView";

const Permissions = () => {
  const { data, isLoading, isError } = usePermissionsQuery();

  return (
    <div className="space-y-8">
      <PermissionsHeader />
      <PermissionsView data={data} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default Permissions;
