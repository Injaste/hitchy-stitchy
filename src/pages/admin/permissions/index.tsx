import { usePermissionsQuery } from "./queries"
import PermissionsHeader from "./components/PermissionsHeader"
import PermissionsMatrix from "./components/PermissionsMatrix"

const Permissions = () => {
  const { data, isLoading, isError } = usePermissionsQuery()

  return (
    <div className="space-y-8">
      <PermissionsHeader />
      <PermissionsMatrix data={data} isLoading={isLoading} isError={isError} />
    </div>
  )
}

export default Permissions
