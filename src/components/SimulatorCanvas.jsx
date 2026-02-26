import React from "react";
import { RefreshCw } from "lucide-react";
import { mapW, mapH } from "../lib/constants";
import { motion, AnimatePresence } from "framer-motion";

import { Map3D } from "./Map3D";

export function SimulatorCanvas({
  miniRef,
  isGenerating,
  heightMap,
  rivers,
  suitabilityMap,
  resourceMap,
  citySnapshots,
  infrastructureSnapshots,
  currentEpoch,
  viewMode,
  seaLevel,
}) {
  return (
    <main className="flex-1 bg-neutral-bg1 flex flex-col relative overflow-hidden">
      <div className="flex-1 relative flex items-center justify-center p-8">
        <div className="relative shadow-2xl shadow-black/80 rounded-xl overflow-hidden glass border-border-strong bg-black/40 w-full h-full">
          <Map3D
            heightMap={heightMap}
            rivers={rivers}
            suitabilityMap={suitabilityMap}
            resourceMap={resourceMap}
            citySnapshots={citySnapshots}
            infrastructureSnapshots={infrastructureSnapshots}
            currentEpoch={currentEpoch}
            viewMode={viewMode}
            seaLevel={seaLevel}
          />

          {/* Info Overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 glass-overlay flex flex-col items-center justify-center gap-4 z-20"
              >
                <RefreshCw className="w-10 h-10 text-brand animate-spin" />
                <div className="text-brand-light font-medium animate-pulse">
                  Simulating History...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimap */}
          <div className="absolute bottom-4 right-4 glass rounded-lg shadow-lg overflow-hidden hidden lg:block hover:scale-110 transition-transform origin-bottom-right duration-300">
            <canvas
              ref={miniRef}
              className="block w-40 h-auto bg-neutral-bg1/80"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
