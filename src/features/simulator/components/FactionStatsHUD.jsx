import React, { useMemo } from "react";
import { factionColors } from "@/features/simulator";
import { Users, TrendingUp, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Computes per-faction statistics from the current epoch snapshot.
 * Population = sum of all tile densities for the faction.
 * Net Worth = density points + road bonus + wall bonus + resource bonus.
 */
function computeFactionStats(
  citySnapshot,
  infraSnapshot,
  resourceMap,
  factionCount,
) {
  if (!citySnapshot) return [];

  const stats = [];
  for (let f = 0; f < factionCount; f++) {
    stats.push({
      factionId: f + 1,
      tiles: 0,
      population: 0,
      netWorth: 0,
      maxDensity: 0,
    });
  }

  for (let i = 0; i < citySnapshot.length; i++) {
    if (citySnapshot[i] === 0) continue;
    const fId = Math.floor(citySnapshot[i] / 10);
    const density = citySnapshot[i] % 10;
    if (fId < 1 || fId > factionCount) continue;

    const s = stats[fId - 1];
    s.tiles++;
    s.population += density;
    s.maxDensity = Math.max(s.maxDensity, density);

    // Net worth: base density value
    let tileWorth = density * 10;
    // Infrastructure bonus
    if (infraSnapshot && infraSnapshot[i] === 1) tileWorth += 5; // Road
    if (infraSnapshot && infraSnapshot[i] === 2) tileWorth += 15; // Wall
    // Resource bonus (if resource is in faction territory)
    if (resourceMap) {
      if (resourceMap[i] === 1) tileWorth += 8; // Forest
      if (resourceMap[i] === 2) tileWorth += 20; // Gold
    }
    s.netWorth += tileWorth;
  }

  // Sort by net worth descending
  stats.sort((a, b) => b.netWorth - a.netWorth);
  return stats;
}

export function FactionStatsHUD({
  citySnapshots,
  infrastructureSnapshots,
  resourceMap,
  currentEpoch,
  desiredFactions,
}) {
  const stats = useMemo(
    () =>
      computeFactionStats(
        citySnapshots?.[currentEpoch],
        infrastructureSnapshots?.[currentEpoch],
        resourceMap,
        desiredFactions || 5,
      ),
    [
      citySnapshots,
      infrastructureSnapshots,
      resourceMap,
      currentEpoch,
      desiredFactions,
    ],
  );

  if (!stats.length) return null;

  const totalPop = stats.reduce((sum, s) => sum + s.population, 0);

  return (
    <div className="absolute top-4 right-4 z-10 glass rounded-lg p-3 w-56 space-y-2 pointer-events-auto select-none">
      <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle pb-1.5">
        <Users size={12} />
        <span>Faction Stats</span>
      </div>

      {stats.map((s, rank) => {
        const color = factionColors[(s.factionId - 1) % factionColors.length];
        const popPct =
          totalPop > 0 ? ((s.population / totalPop) * 100).toFixed(0) : 0;

        return (
          <div key={s.factionId} className="flex items-center gap-2">
            {/* Rank indicator */}
            <span className="text-[9px] font-bold text-text-muted w-3">
              {rank === 0 ? (
                <ChevronUp size={10} className="text-green-400" />
              ) : rank === stats.length - 1 ? (
                <ChevronDown size={10} className="text-red-400" />
              ) : (
                <span className="text-text-muted">·</span>
              )}
            </span>

            {/* Color dot */}
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: color }}
            />

            {/* Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-secondary font-medium">
                  F{s.factionId}
                </span>
                <span className="text-text-primary font-bold">
                  {s.population.toLocaleString()}
                  <span className="text-text-muted font-normal ml-0.5">
                    ({popPct}%)
                  </span>
                </span>
              </div>
              {/* Worth bar */}
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp size={8} className="text-text-muted shrink-0" />
                <span className="text-[9px] text-text-muted">
                  {s.netWorth.toLocaleString()}
                </span>
                <span className="text-[9px] text-text-muted ml-auto">
                  {s.tiles} tiles
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
