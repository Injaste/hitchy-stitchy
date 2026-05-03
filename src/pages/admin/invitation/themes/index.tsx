import { useTemplatesQuery } from "./queries"
import ThemesHeader from "./components/ThemesHeader"
import ThemesView from "./components/ThemesView"

const ThemesSection = () => {
  const { data: templates, isLoading, isError, refetch, isRefetching } = useTemplatesQuery()

  return (
    <div className="space-y-8">
      <ThemesHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <ThemesView
        templates={templates ?? []}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
    </div>
  )
}

export default ThemesSection
