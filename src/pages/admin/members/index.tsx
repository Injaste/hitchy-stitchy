import { useMembersQuery } from "./queries"

import MembersHeader from "./components/MembersHeader"
import MembersView from "./components/MembersView"
import Container from "@/components/custom/container"

const Members = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useMembersQuery()

  return (
    <>
      <MembersHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing size="md">
        <MembersView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
      </Container>
    </>
  )
}

export default Members
