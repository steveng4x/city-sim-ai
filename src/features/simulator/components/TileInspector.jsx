import React from "react";
import { X, MapPin } from "lucide-react";
import { factionColors } from "@/features/simulator";

const RESOURCE_NAMES = { 0: "None", 1: "Forest", 2: "Gold" };
const INFRA_NAMES = { 0: "None", 1: "Road", 2: "Wall" };
const DENSITY_LABELS = {
  0: "Empty",
  1: "Hamlet",
  2: "Village",
  3: "Town",
  4: "Large Town",
  5: "City",
  6: "Large City",
  7: "Metropolis",
  8: "Major Metropolis",
  9: "Mega-City",
};

export function TileInspector({ tile, onClose }) {
  if (!tile) return null;

  const color = tile.factionId
    ? factionColors[(tile.factionId - 1) % factionColors.length]
    : null;

  return (
    <div className="absolute bottom-4 left-4 z-30 glass rounded-lg shadow-lg border border-border-default w-64 pointer-events-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
          <MapPin size={12} />
          <span>Tile Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-neutral-bg4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-2 text-xs">
        {/* Coordinates */}
        <div className="flex justify-between">
          <span className="text-text-muted">Position</span>
          <span className="text-text-primary font-mono">
            ({tile.x}, {tile.y})
          </span>
        </div>

        {/* Terrain */}
        <div className="flex justify-between">
          <span className="text-text-muted">Terrain</span>
          <span className="text-text-primary">
            {tile.isOcean ? "Ocean" : tile.isRiver ? "River" : "Land"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Elevation</span>
          <span className="text-text-primary">
            {(tile.elevation * 100).toFixed(0)}m
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Suitability</span>
          <span className="text-text-primary">
            {(tile.suitability * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">Resource</span>
          <span className="text-text-primary">
            {RESOURCE_NAMES[tile.resource] || "None"}
          </span>
        </div>

        {/* Settlement info */}
        {tile.factionId > 0 && (
          <>
            <hr className="border-border-subtle" />
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Faction</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-primary font-medium">
                  F{tile.factionId}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-text-muted">Density</span>
              <span className="text-text-primary">
                {tile.density} — {DENSITY_LABELS[tile.density]}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-muted">Infrastructure</span>
              <span className="text-text-primary">
                {INFRA_NAMES[tile.infraType] || "None"}
              </span>
            </div>

            {tile.provinceId > 0 && (
              <div className="flex justify-between">
                <span className="text-text-muted">Province</span>
                <span className="text-text-primary">#{tile.provinceId}</span>
              </div>
            )}

            {tile.megaCityName && (
              <div className="flex justify-between">
                <span className="text-text-muted">Mega-City</span>
                <span className="text-brand-light font-bold">
                  {tile.megaCityName}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
