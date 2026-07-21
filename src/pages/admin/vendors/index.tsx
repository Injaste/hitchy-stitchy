import Container from "@/components/custom/container"

import { useVendorsQuery } from "./queries"
import VendorsHeader from "./components/VendorsHeader"
import VendorsView from "./components/VendorsView"
import VendorModals from "./modals"

const Vendors = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useVendorsQuery()

  return (
    <>
      <VendorsHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing size="md">
        <VendorsView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <VendorModals />
      </Container>
    </>
  )
}

export default Vendors
