import React from "react";
import { Sparkles, RefreshCw, Zap, ScrollText, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SimulatorControls({
  seed,
  setSeed,
  seaLevel,
  setSeaLevel,
  desiredFactions,
  setDesiredFactions,
  isGenerating,
  isGeneratingLore,
  lore,
  executeGeneration,
  dreamWorldWithAI,
  showRivers,
  setShowRivers,
  showResources,
  setShowResources,
  viewMode,
  setViewMode,
}) {
  return (
    <aside className="w-80 glass-panel p-6 flex flex-col gap-6 overflow-y-auto z-10 border-r border-border-default">
      {/* AI Section */}
      <motion.div
        layout
        className="glass-card p-4 bg-gradient-to-br from-brand-subtle to-transparent border-brand-subtle"
      >
        <h2 className="text-xs font-bold text-brand-light uppercase tracking-widest mb-3 flex items-center gap-2">
          <Sparkles size={14} /> Oracle
        </h2>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          Ask the AI to dream a world history and geography.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={dreamWorldWithAI}
          disabled={isGenerating || isGeneratingLore}
          className="w-full py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-glow"
        >
          {isGeneratingLore ? (
            <RefreshCw className="animate-spin w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" />
          )}{" "}
          Dream World
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {lore && !isGeneratingLore && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            layout
            className="glass-card p-4 space-y-4"
          >
            <div className="flex items-center gap-2 text-text-secondary border-b border-border-subtle pb-2">
              <ScrollText size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                World Archives
              </h2>
            </div>
            <h3 className="text-lg font-black text-brand-light leading-tight">
              {lore.name || "Unknown Land"}
            </h3>

            {lore.foundingMyth && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-muted uppercase">
                  Founding Myth
                </span>
                <p className="text-xs text-text-secondary leading-relaxed italic">
                  "{lore.foundingMyth}"
                </p>
              </div>
            )}
            {lore.culture && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-muted uppercase">
                  Culture
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {lore.culture}
                </p>
              </div>
            )}
            {lore.notableEvent && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-muted uppercase">
                  Notable Event
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {lore.notableEvent}
                </p>
              </div>
            )}
            {lore.error && (
              <div className="text-status-error text-xs mt-2 border-t border-status-error/20 pt-2">
                {lore.error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="border-border-default" />

      {/* Manual Controls */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Settings2 size={14} /> Parameters
          </h2>
          {isGenerating && (
            <RefreshCw size={14} className="animate-spin text-brand-light" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setViewMode("city")}
            className={`w-full py-1.5 text-xs font-medium rounded transition-colors ${
              viewMode === "city"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            City Density
          </button>
          <button
            onClick={() => setViewMode("province")}
            className={`w-full py-1.5 text-xs font-medium rounded transition-colors ${
              viewMode === "province"
                ? "bg-indigo-900/40 text-indigo-200 shadow-sm ring-1 ring-inset ring-indigo-700/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Provinces
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`w-full py-1.5 text-xs font-medium rounded transition-colors ${
              viewMode === "heatmap"
                ? "bg-amber-900/40 text-amber-200 shadow-sm ring-1 ring-inset ring-amber-700/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Suitability Heatmap
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Sea Level</span>{" "}
            <span className="text-white">{Math.round(seaLevel * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="0.6"
            step="0.01"
            value={seaLevel}
            onChange={(e) => setSeaLevel(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-bg4 rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Factions</span>{" "}
            <span className="text-white">{desiredFactions}</span>
          </div>
          <input
            type="range"
            min="2"
            max="5"
            value={desiredFactions}
            onChange={(e) => setDesiredFactions(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-bg4 rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">
            Rivers
          </span>
          <button
            onClick={() => setShowRivers(!showRivers)}
            role="switch"
            aria-checked={showRivers}
            aria-label="Toggle rivers"
            className={`w-8 h-4 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${showRivers ? "bg-brand" : "bg-neutral-bg4"}`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${showRivers ? "translate-x-4" : "translate-x-1"}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">
            Resources
          </span>
          <button
            onClick={() => setShowResources(!showResources)}
            role="switch"
            aria-checked={showResources}
            aria-label="Toggle resources"
            className={`w-8 h-4 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${showResources ? "bg-brand" : "bg-neutral-bg4"}`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${showResources ? "translate-x-4" : "translate-x-1"}`}
            />
          </button>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => executeGeneration(seed, seaLevel, desiredFactions)}
            disabled={isGenerating || isGeneratingLore}
            className="flex-1 py-2 bg-neutral-bg3 hover:bg-neutral-bg4 disabled:opacity-50 disabled:cursor-not-allowed border border-border-default rounded-lg text-xs font-bold text-text-primary transition-colors"
          >
            Rebuild
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const ns = Math.floor(Math.random() * 10000);
              setSeed(ns);
              executeGeneration(ns, seaLevel, desiredFactions);
            }}
            disabled={isGenerating || isGeneratingLore}
            className="flex-1 py-2 bg-neutral-bg3 hover:bg-neutral-bg4 disabled:opacity-50 disabled:cursor-not-allowed border border-border-default rounded-lg text-xs font-bold text-text-primary transition-colors"
          >
            Reroll
          </motion.button>
        </div>
      </div>

      <div className="mt-auto glass-card p-4 text-xs space-y-2">
        <h4 className="font-bold text-text-muted uppercase tracking-widest mb-3">
          Density Legend
        </h4>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-brand-subtle"></div>{" "}
          <span className="text-text-secondary">Rural (1-2)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-brand/60"></div>{" "}
          <span className="text-text-secondary">Suburb (3-4)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-brand"></div>{" "}
          <span className="text-text-secondary">City (5-6)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded bg-brand flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>{" "}
          <span className="text-text-secondary">Megacity (7-9)</span>
        </div>
      </div>
    </aside>
  );
}
