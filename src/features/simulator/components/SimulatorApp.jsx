import React, { useRef, useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { SimulatorControls } from "./SimulatorControls";
import { SimulatorCanvas } from "./SimulatorCanvas";
import { SimulatorTimeline } from "./SimulatorTimeline";
import { useSimulatorEngine } from "../hooks/useSimulatorEngine";
import { useSimulatorAnimation } from "../hooks/useSimulatorAnimation";
import { maxEpochs } from "@/features/simulator";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

export function SimulatorApp() {
  const navigate = useNavigate();
  const miniRef = useRef(null);
  const [showRivers, setShowRivers] = useState(true);
  const [showResources, setShowResources] = useState(true);

  const engine = useSimulatorEngine();
  const { startTransition } = useSimulatorAnimation({
    miniRef,
    heightMap: engine.heightMap,
    rivers: engine.rivers,
    suitabilityMap: engine.suitabilityMap,
    resourceMap: engine.resourceMap,
    citySnapshots: engine.citySnapshots,
    infrastructureSnapshots: engine.infrastructureSnapshots,
    currentEpoch: engine.currentEpoch,
    setCurrentEpoch: engine.setCurrentEpoch,
    viewMode: engine.viewMode,
    seaLevel: engine.seaLevel,
    playing: engine.playing,
    setPlaying: engine.setPlaying,
    maxEpochs,
    finishGeneration: engine.finishGeneration, // Added finishGeneration here
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col h-screen bg-neutral-bg1 text-text-primary font-sans overflow-hidden"
    >
      <header className="flex items-center justify-between px-6 py-4 glass-panel border-b border-border-default z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-neutral-bg4 text-text-secondary hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="text-brand w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">
              CitySim Engine{" "}
              <span className="text-text-muted text-sm font-normal ml-2">
                v2.5 Clustering
              </span>
            </h1>
          </div>
        </div>
        <div className="flex glass p-1 rounded-lg">
          {["terrain", "heatmap", "city", "province"].map((m) => (
            <button
              key={m}
              onClick={() => engine.setViewMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${engine.viewMode === m ? "bg-neutral-bg4 text-white shadow-sm" : "text-text-secondary hover:text-white hover:bg-neutral-bg3"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <SimulatorControls
          {...engine}
          showRivers={showRivers}
          setShowRivers={setShowRivers}
          showResources={showResources}
          setShowResources={setShowResources}
        />

        <div className="flex-1 flex flex-col z-0">
          <SimulatorCanvas
            miniRef={miniRef}
            isGenerating={engine.isGenerating}
            heightMap={engine.heightMap}
            rivers={engine.rivers}
            suitabilityMap={engine.suitabilityMap}
            resourceMap={engine.resourceMap}
            citySnapshots={engine.citySnapshots}
            infrastructureSnapshots={engine.infrastructureSnapshots}
            provinceSnapshots={engine.provinceSnapshots}
            warEventSnapshots={engine.warEventSnapshots}
            provinceRegistry={engine.provinceRegistry}
            currentEpoch={engine.currentEpoch}
            viewMode={engine.viewMode}
            seaLevel={engine.seaLevel}
            finishGeneration={engine.finishGeneration}
            showRivers={showRivers}
            showResources={showResources}
          />
          <SimulatorTimeline
            playing={engine.playing}
            setPlaying={engine.setPlaying}
            currentEpoch={engine.currentEpoch}
            maxEpochs={maxEpochs}
            startTransition={startTransition}
          />
        </div>
      </div>
    </motion.div>
  );
}
