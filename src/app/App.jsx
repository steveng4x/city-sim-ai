import React from "react";
import { LandingPage } from "@/features/landing/components/LandingPage";
import ProvinceSystemDiagram from "@/features/landing/components/LogicPage";
import { SimulatorApp } from "@/features/simulator";
import { AnimatePresence } from "framer-motion";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorApp />} />
        <Route path="/logic" element={<ProvinceSystemDiagram />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--color-neutral-bg2, #020617); }
        ::-webkit-scrollbar-thumb { background: var(--color-neutral-bg5, #334155); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--color-neutral-bg6, #475569); }
        
        .chart-container { position: relative; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto; height: 300px; max-height: 400px; }
        @media (min-width: 768px) { .chart-container { height: 350px; } }
      `}</style>
      <HashRouter>
        <AnimatedRoutes />
      </HashRouter>
    </>
  );
}
