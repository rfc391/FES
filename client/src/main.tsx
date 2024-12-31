
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { UserContext } from "./hooks/use-user";
import App from './App';
import "./index.css";

function initializeApp() {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        throw new Error("Failed to find root element");
    }

    createRoot(rootElement).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <UserContext.Provider value={null}>
                    <App />
                    <Toaster />
                </UserContext.Provider>
            </QueryClientProvider>
        </StrictMode>
    );
}

// Start the application
initializeApp();
