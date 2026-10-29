import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { DesignSystem } from "./DesignSystem";
import "./style.css";
const root = document.getElementById("root");
if (!root) throw new Error("Missing root");
createRoot(root).render(
  <StrictMode>
    {window.location.pathname === "/design-system" ? <DesignSystem /> : <App />}
  </StrictMode>
);
