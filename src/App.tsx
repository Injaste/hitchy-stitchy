import { BrowserRouter } from "react-router-dom";

import AppConfigs from "./app/AppConfigs";
import AppRoutes from "./app/AppRoutes";
import AppGlobals from "./app/AppGlobals";
import AppPortals from "./app/AppPortals";

export default function App() {
  return (
    <AppConfigs>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <AppGlobals />
      <AppPortals />
    </AppConfigs>
  );
}
