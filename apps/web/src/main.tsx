import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/router";
import { queryClient } from "@/providers/QueryClientProvider";
import { App } from "@/App";
import { SnackbarContainer } from "./components/common/snackbar";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/styles/globals.css";
import "@/styles/mixin.scss";
import "@/styles/dplayer.scss";
import "@/styles/global.css";
import "@/styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {" "}
      <TooltipProvider>
        <RouterProvider router={router} />
        <SnackbarContainer />

        <App />
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
