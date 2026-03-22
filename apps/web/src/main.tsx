import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/router";
import { queryClient } from "@/providers/QueryClientProvider";
import { Toaster } from "./components/ui/sonner";
import { App } from "./App";

import "@/styles/globals.css";
import "@/styles/mixin.scss";
import "@/styles/dplayer.scss";
import "@/styles/global.css";
import "@/styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
