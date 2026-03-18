import React from "react";
import { factionColors } from "@/features/simulator";

export function CityTooltip({ tooltip }) {
  if (!tooltip) return null;

  const color = factionColors[(tooltip.factionId - 1) % factionColors.length];

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: tooltip.screenX,
        top: tooltip.screenY,
        transform: "translate(-50%, -120%)",
      }}
    >
      <div className="glass rounded-lg px-3 py-2 shadow-lg border border-border-default min-w-[120px]">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-bold text-text-primary">
            {tooltip.name}
          </span>
        </div>
        <div className="text-[10px] text-text-muted space-y-0.5">
          <div>
            Faction {tooltip.factionId} · Density {tooltip.density}
          </div>
        </div>
      </div>
      {/* Arrow pointing down */}
      <div className="flex justify-center -mt-px">
        <div className="w-2 h-2 bg-neutral-bg2 border-r border-b border-border-default rotate-45 -translate-y-1" />
      </div>
    </div>
  );
}
