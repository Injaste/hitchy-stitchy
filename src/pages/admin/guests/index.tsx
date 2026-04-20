import { useGuestsQuery, useGuestsRealtime } from "./queries"
import GuestsHeader from "./components/GuestsHeader"
import GuestsView from "./components/GuestsView"
import GuestModals from "./modals"

const Guests = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useGuestsQuery()
  useGuestsRealtime()

  return (
    <div className="space-y-8">
      <GuestsHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <GuestsView
        data={data}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <GuestModals />
    </div>
  )
}

export default Guests
