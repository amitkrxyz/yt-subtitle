import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import ytsub from "./assets/ytsub.svg";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="h-16 py-2 px-4 gap-2 bg-background shadow-sm shadow-primary flex items-center">
        <img className="h-full" src={ytsub} />
        <h1 className="font-bold italic text-2xl">
          YT&nbsp;
          <span className="text-primary">Subtitle</span>
        </h1>
      </div>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
