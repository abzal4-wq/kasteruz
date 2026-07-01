import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./i18n/index";
import "./index.css";
import App from "./app/App";
import { initTheme, initBgMode } from "./lib/theme";
import { registerSW } from "./lib/pwa";

// Saqlangan mavzu va fon rejimini render'dan oldin qo'llash (miltillashning oldini olish)
initTheme();
initBgMode();

// PWA — service worker (o'rnatiladigan ilova + offline)
registerSW();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 daqiqa
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </React.StrictMode>
);
