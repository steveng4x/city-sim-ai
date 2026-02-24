import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { SimulatorApp } from "./components/SimulatorApp";
import { AnimatePresence } from "framer-motion";

export default function App() {
  const [view, setView] = useState("landing");

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

      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <LandingPage key="landing" onLaunchSimulator={() => setView("sim")} />
        ) : (
          <SimulatorApp key="sim" onBackToDocs={() => setView("landing")} />
        )}
      </AnimatePresence>
    </>
  );
}
