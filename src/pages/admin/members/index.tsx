import { useMembersQuery } from "./queries"

import MembersHeader from "./components/MembersHeader"
import MembersView from "./components/MembersView"
import MemberModals from "./modals"
import Container from "@/components/custom/container"

const Members = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useMembersQuery()

  return (
    <Container>
      <MembersHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <MembersView
        data={data}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <MemberModals />
    </Container>
  )
}

export default Members
