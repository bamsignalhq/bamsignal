import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { PlansProvider } from "./context/PlansContext";
import "./styles.css";
import "./styles/experience.css";
import "./styles/signals.css";
import "./styles/visual-home.css";
import "./styles/home-landing.css";
import "./styles/auth.css";
import "./styles/v6.css";
import "./styles/safety.css";
import "./styles/launch.css";
import "./styles/discover-v2.css";
import "./styles/footer.css";
import "./styles/dashboard.css";
import "./styles/blog.css";
import "./styles/legal-pages.css";
import "./styles/member-pages.css";
import "./styles/moment-pages.css";
import "./styles/theme-contrast.css";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlansProvider>
      <App />
    </PlansProvider>
  </React.StrictMode>
);
