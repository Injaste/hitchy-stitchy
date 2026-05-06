import { useTemplatesWithThemesQuery } from "../queries";
import ThemesView from "./components/ThemesView";

const Themes = () => {
  const { data } = useTemplatesWithThemesQuery();

  return <ThemesView templates={data ?? []} />;
};

export default Themes;
