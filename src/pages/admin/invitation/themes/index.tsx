import { useTemplatesQuery, useThemesQuery } from "./queries";
import ThemesView from "./components/ThemesView";

const Themes = () => {
  const {
    data: templates,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTemplatesQuery();
  const {
    data: themes,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useThemesQuery();

  return (
    <div className="space-y-8">
      <ThemesView
        templates={templates ?? []}
        themes={themes ?? []}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
    </div>
  );
};

export default Themes;
