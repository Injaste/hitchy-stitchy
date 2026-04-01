import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      <App />
    </MotionConfig>
  </StrictMode>,
);
