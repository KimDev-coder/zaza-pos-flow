import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index.tsx";
import Ventes from "./pages/Ventes.tsx";
import Stock from "./pages/Stock.tsx";
import Achats from "./pages/Achats.tsx";
import Profil from "./pages/Profil.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";

const queryClient = new QueryClient();

const App = () => {
  const [stage, setStage] = useState<"splash" | "login" | "app">("splash");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-center" richColors />
        <AnimatePresence mode="wait">
          {stage === "splash" && <Splash key="splash" onDone={() => setStage("login")} />}
          {stage === "login" && <Login key="login" onSuccess={() => setStage("app")} />}
        </AnimatePresence>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ventes" element={<Ventes />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/achats" element={<Achats />} />
            <Route path="/profil" element={<Profil onLogout={() => setStage("login")} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
