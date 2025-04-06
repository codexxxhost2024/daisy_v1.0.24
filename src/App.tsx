
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ListPage from "./pages/ListPage";
import TemplatePage from "./pages/TemplatePage";
import VoicePage from "./pages/VoicePage";
import ProfilePage from "./pages/ProfilePage";
import ScribePage from "./pages/ScribePage";
import EditPage from './pages/EditPage'; // Import the new EditPage
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Set ScribePage as the homepage */}
            <Route path="/" element={<ScribePage />} /> 
            <Route path="/list" element={<ListPage />} />
            <Route path="/template" element={<TemplatePage />} />
            <Route path="/voice" element={<VoicePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/scribe" element={<ScribePage />} />
            <Route path="/edit/:filename" element={<EditPage />} /> {/* Add route for EditPage */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
