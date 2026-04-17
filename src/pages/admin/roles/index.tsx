import { useRolesQuery } from "./queries"
import { useMembersQuery } from "../members/queries"

import RolesHeader from "./components/RolesHeader"
import RolesView from "./components/RolesView"
import RoleModals from "./modals"

const Roles = () => {
  const {
    data: roles,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useRolesQuery()
  const { data: members } = useMembersQuery()

  return (
    <div className="space-y-8">
      <RolesHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={roles}
      />
      <RolesView
        roles={roles}
        members={members}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <RoleModals />
    </div>
  )
}

export default Roles
