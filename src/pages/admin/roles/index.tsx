import { useRolesQuery } from "./queries"
import { useMembersQuery } from "../members/queries"

import RolesHeader from "./components/RolesHeader"
import RolesView from "./components/RolesView"
import RoleModals from "./modals"
import Container from "@/components/custom/container"

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
    <>
      <RolesHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={roles}
      />
      <Container className="mt-8">
        <RolesView
          roles={roles}
          members={members}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <RoleModals />
      </Container>
    </>
  )
}

export default Roles
