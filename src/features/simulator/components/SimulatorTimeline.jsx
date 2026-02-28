import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export function SimulatorTimeline({
  playing,
  setPlaying,
  currentEpoch,
  maxEpochs,
  startTransition,
}) {
  return (
    <div className="bg-neutral-bg2 border-t border-border-default p-4 shrink-0 z-20">
      <div className="max-w-4xl mx-auto flex items-center gap-6">
        <div className="flex gap-2 shrink-0">
          <button
            aria-label="Restart simulation"
            onClick={() => {
              setPlaying(false);
              startTransition(currentEpoch, 0, 400);
            }}
            className="p-2 rounded-full hover:bg-neutral-bg4 text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipBack size={20} />
          </button>
          <button
            aria-label={playing ? "Pause simulation" : "Play simulation"}
            onClick={() => setPlaying(!playing)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-brand hover:bg-brand-hover text-white shadow-glow transition-all"
          >
            {playing ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            aria-label="Skip to end of simulation"
            onClick={() => {
              setPlaying(false);
              startTransition(currentEpoch, maxEpochs, 400);
            }}
            className="p-2 rounded-full hover:bg-neutral-bg4 text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex-1 relative group">
          <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
            <span>Year 0</span>
            <span className="text-brand-light">Epoch {currentEpoch}</span>
            <span>Year {maxEpochs * 10}</span>
          </div>
          <div className="relative h-2 bg-neutral-bg4 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-brand transition-all duration-100 ease-linear"
              style={{ width: `${(currentEpoch / maxEpochs) * 100}%` }}
            ></div>
          </div>
          <input
            type="range"
            min="0"
            max={maxEpochs}
            value={currentEpoch}
            aria-label="Scrub simulation timeline"
            onChange={(e) => {
              setPlaying(false);
              const target = Number(e.target.value);
              startTransition(currentEpoch, target, 400);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
