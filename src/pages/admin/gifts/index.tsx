import Container from "@/components/custom/container"

import { useGiftsQuery } from "./queries"
import GiftsHeader from "./components/GiftsHeader"
import GiftsView from "./components/GiftsView"
import GiftModals from "./modals"

const Gifts = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useGiftsQuery()

  return (
    <>
      <GiftsHeader
        data={data}
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing size="md">
        <GiftsView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <GiftModals />
      </Container>
    </>
  )
}

export default Gifts
