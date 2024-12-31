import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { UserContext } from "./hooks/use-user";
import App from './App';
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element not found");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={null}>
        <App />
        <Toaster />
      </UserContext.Provider>
    </QueryClientProvider>
  </StrictMode>,
);