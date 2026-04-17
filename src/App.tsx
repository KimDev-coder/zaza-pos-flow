import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index.tsx";
import Ventes from "./pages/Ventes.tsx";
import Stock from "./pages/Stock.tsx";
import Achats from "./pages/Achats.tsx";
import Profil from "./pages/Profil.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Splash } from "./components/Splash";
import { Onboarding } from "./components/Onboarding";

const queryClient = new QueryClient();

const ONBOARDED_KEY = "zazafood:onboarded";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!showSplash) {
      const done = localStorage.getItem(ONBOARDED_KEY);
      if (!done) setShowOnboarding(true);
    }
  }, [showSplash]);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    setShowOnboarding(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-center" richColors />
        <AnimatePresence>
          {showSplash && <Splash key="splash" onDone={() => setShowSplash(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {!showSplash && showOnboarding && <Onboarding key="onb" onDone={finishOnboarding} />}
        </AnimatePresence>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ventes" element={<Ventes />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/achats" element={<Achats />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
