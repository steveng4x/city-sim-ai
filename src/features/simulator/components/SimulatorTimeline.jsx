import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  FastForward,
} from "lucide-react";

export function SimulatorTimeline({
  playing,
  setPlaying,
  currentEpoch,
  maxEpochs,
  latestComputedEpoch,
  infiniteMode,
  isComputingAhead,
  continueSimulation,
  startTransition,
}) {
  const [jumpValue, setJumpValue] = useState("");
  const effectiveMax = infiniteMode ? latestComputedEpoch : maxEpochs;
  const atClassicEnd = !infiniteMode && currentEpoch >= maxEpochs;

  const handleJump = (e) => {
    e.preventDefault();
    const target = Math.max(0, Math.min(Number(jumpValue), effectiveMax));
    if (!isNaN(target)) {
      setPlaying(false);
      startTransition(currentEpoch, target, 400);
      setJumpValue("");
    }
  };

  return (
    <div className="bg-neutral-bg2 border-t border-border-default p-4 shrink-0 z-20">
      <div className="max-w-4xl mx-auto flex items-center gap-6">
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setPlaying(false);
              startTransition(currentEpoch, 0, 400);
            }}
            aria-label="Rewind to beginning"
            title="Rewind to beginning"
            className="p-2 rounded-full hover:bg-neutral-bg4 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? "Pause simulation" : "Play simulation"}
            title={playing ? "Pause simulation" : "Play simulation"}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-brand hover:bg-brand-hover text-white shadow-glow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {playing ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              startTransition(currentEpoch, effectiveMax, 400);
            }}
            aria-label="Skip to end"
            title="Skip to end"
            className="p-2 rounded-full hover:bg-neutral-bg4 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex-1 relative group">
          <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
            <span>Year 0</span>
            <span className="text-brand-light flex items-center gap-1.5">
              Epoch {currentEpoch}
              {infiniteMode && (
                <span className="text-brand opacity-70 text-[10px]">∞</span>
              )}
              {isComputingAhead && (
                <Loader2 size={12} className="animate-spin text-brand-light" />
              )}
            </span>
            <span>
              {infiniteMode
                ? `Epoch ${effectiveMax}`
                : `Year ${maxEpochs * 10}`}
            </span>
          </div>
          <div className="relative h-2 bg-neutral-bg4 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-brand transition-all duration-100 ease-linear"
              style={{
                width: `${(currentEpoch / effectiveMax) * 100}%`,
              }}
            ></div>
            {infiniteMode && isComputingAhead && (
              <div className="absolute top-0 right-0 h-full w-4 bg-brand/30 animate-pulse rounded-r-full"></div>
            )}
          </div>
          <input
            type="range"
            min="0"
            max={effectiveMax}
            value={currentEpoch}
            onChange={(e) => {
              setPlaying(false);
              const target = Number(e.target.value);
              startTransition(currentEpoch, target, 400);
            }}
            aria-label="Timeline progress"
            title="Timeline progress"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:rounded"
          />
        </div>

        {/* Continue Simulation button — shown at epoch 80 in classic mode */}
        {atClassicEnd && (
          <button
            onClick={continueSimulation}
            title="Continue simulation beyond epoch 80"
            className="flex items-center gap-1.5 px-3 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-glow shrink-0 animate-pulse hover:animate-none"
          >
            <FastForward size={14} /> Continue
          </button>
        )}

        {/* Jump to Epoch — shown in infinite mode */}
        {infiniteMode && (
          <form
            onSubmit={handleJump}
            className="flex items-center gap-1 shrink-0"
          >
            <input
              type="number"
              min="0"
              max={effectiveMax}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder="Go to…"
              className="w-20 px-2 py-1.5 bg-neutral-bg3 border border-border-default rounded text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </form>
        )}
      </div>
    </div>
  );
}
