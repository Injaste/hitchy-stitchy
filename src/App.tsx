import { BrowserRouter } from "react-router-dom";
import { Lenis } from "lenis/react";

import AppConfigs from "./app/AppConfigs";
import AppRoutes from "./app/AppRoutes";
import AppGlobals from "./app/AppGlobals";
import AppPortals from "./app/AppPortals";

export default function App() {
  return (
    <Lenis
      root
      options={{
        prevent: () => document.body.hasAttribute("data-scroll-locked"),
      }}
    >
      <AppConfigs>
        <AppPortals>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppPortals>
        <AppGlobals />
      </AppConfigs>
    </Lenis>
  );
}
