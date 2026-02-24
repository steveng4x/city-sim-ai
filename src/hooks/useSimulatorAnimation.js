import { useCallback, useEffect } from "react";
import { mapW, mapH, tileSize, factionColors } from "../lib/constants";

export function useSimulatorAnimation({
  canvasRef,
  miniRef,
  animRef,
  diffRef,
  heightMap,
  rivers,
  suitabilityMap,
  citySnapshots,
  currentEpoch,
  setCurrentEpoch,
  viewMode,
  seaLevel,
  playing,
  setPlaying,
  maxEpochs,
}) {
  const computeDiff = useCallback((fromSnap, toSnap) => {
    const grown = new Set();
    const conquered = new Set();
    const sprawled = new Set();
    const razed = new Set();

    if (!fromSnap || !toSnap) return { grown, conquered, sprawled, razed };

    for (let i = 0; i < fromSnap.length; i++) {
      const fv = fromSnap[i],
        tv = toSnap[i];
      if (fv === tv) continue;
      const ff = Math.floor(fv / 10),
        tf = Math.floor(tv / 10);
      const fd = fv % 10,
        td = tv % 10;
      if (fv === 0 && tv > 0) sprawled.add(i);
      else if (tv === 0 && fv > 0) razed.add(i);
      else if (ff !== tf && tf > 0) conquered.add(i);
      else if (ff === tf && td > fd) grown.add(i);
    }
    return { grown, conquered, sprawled, razed };
  }, []);

  const hexToRgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const drawMain = useCallback(
    (fromEpochArg, toEpochArg, tArg, diffArg) => {
      const cvs = canvasRef.current;
      if (!cvs || !heightMap) return;
      const ctx = cvs.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const width = mapW * tileSize;
      const height = mapH * tileSize;
      cvs.width = width * dpr;
      cvs.height = height * dpr;
      ctx.scale(dpr, dpr);

      const fromEpoch =
        fromEpochArg !== undefined ? fromEpochArg : currentEpoch;
      const toEpoch = toEpochArg !== undefined ? toEpochArg : currentEpoch;
      const t = tArg !== undefined ? tArg : 1;
      const diff = diffArg !== undefined ? diffArg : null;
      const isAnimating = diff !== null && t < 1;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Terrain
      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const i = y * mapW + x;
          const elev = heightMap[i];
          if (viewMode === "heatmap") {
            if (elev <= seaLevel) ctx.fillStyle = "#0f172a";
            else {
              const s = suitabilityMap ? suitabilityMap[i] : 0;
              const r = Math.floor(s * 255);
              ctx.fillStyle = `rgb(${r}, ${Math.floor(r * 0.8)}, 50)`;
            }
          } else {
            if (elev <= seaLevel) ctx.fillStyle = "#1e3a8a";
            else if (elev <= seaLevel + 0.02) ctx.fillStyle = "#3b82f6";
            else if (elev <= seaLevel + 0.05) ctx.fillStyle = "#fde047";
            else if (elev > 0.85) ctx.fillStyle = "#f1f5f9";
            else if (elev > 0.7) ctx.fillStyle = "#64748b";
            else ctx.fillStyle = "#166534";
          }
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }

      // 2. Draw Rivers
      if (rivers && viewMode !== "heatmap") {
        ctx.fillStyle = "#60a5fa";
        for (let i = 0; i < rivers.length; i++) {
          if (rivers[i]) {
            const x = i % mapW;
            const y = Math.floor(i / mapW);
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          }
        }
      }

      // 3. Draw Cities
      const toSnap = citySnapshots[toEpoch];
      const fromSnap = citySnapshots[fromEpoch];

      if (viewMode === "city" && toSnap) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.fillRect(0, 0, width, height);

        const densityAlpha = (d) =>
          d >= 7 ? 1.0 : d >= 5 ? 0.95 : d >= 3 ? 0.6 : 0.25;

        const drawTile = (i, snap) => {
          const val = snap[i];
          if (val === 0) return;
          const x = i % mapW,
            y = Math.floor(i / mapW);
          const tId = Math.floor(val / 10);
          const density = val % 10;
          const color = factionColors[(tId - 1) % factionColors.length];

          ctx.fillStyle = hexToRgba(color, densityAlpha(density));
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

          if (density >= 7) {
            ctx.fillStyle = "#ffffff";
            const center = tileSize / 2;
            const sz = density === 9 ? 4 : 2;
            ctx.fillRect(
              x * tileSize + center - sz / 2,
              y * tileSize + center - sz / 2,
              sz,
              sz,
            );
          }
        };

        if (!isAnimating) {
          for (let i = 0; i < toSnap.length; i++) drawTile(i, toSnap);
        } else {
          // Pass 1: unchanged tiles
          for (let i = 0; i < toSnap.length; i++) {
            if (
              diff.conquered.has(i) ||
              diff.grown.has(i) ||
              diff.sprawled.has(i) ||
              diff.razed.has(i)
            )
              continue;
            drawTile(i, toSnap);
          }

          // Pass 2: animated tiles
          diff.sprawled.forEach((i) => {
            const tv = toSnap[i];
            if (!tv) return;
            const x = i % mapW,
              y = Math.floor(i / mapW);
            const tId = Math.floor(tv / 10),
              density = tv % 10;
            const color = factionColors[(tId - 1) % factionColors.length];
            ctx.save();
            ctx.globalAlpha = densityAlpha(density) * t;
            ctx.fillStyle = color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.restore();
          });

          diff.razed.forEach((i) => {
            const fv = fromSnap[i];
            if (!fv) return;
            const x = i % mapW,
              y = Math.floor(i / mapW);
            const tId = Math.floor(fv / 10),
              density = fv % 10;
            const color = factionColors[(tId - 1) % factionColors.length];
            ctx.save();
            ctx.globalAlpha = densityAlpha(density) * (1 - t);
            ctx.fillStyle = color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.restore();
          });

          diff.conquered.forEach((i) => {
            const fv = fromSnap[i],
              tv = toSnap[i];
            const x = i % mapW,
              y = Math.floor(i / mapW);
            ctx.save();
            if (t < 0.35) {
              const oldTId = Math.floor(fv / 10),
                oldDensity = fv % 10;
              const oldColor =
                factionColors[(oldTId - 1) % factionColors.length];
              ctx.globalAlpha = 1;
              ctx.fillStyle = hexToRgba(oldColor, densityAlpha(oldDensity));
              ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

              const flashT = Math.sin((t / 0.35) * Math.PI * 6);
              const flashAlpha = (1 - t / 0.35) * Math.abs(flashT);
              ctx.shadowBlur = 12;
              ctx.shadowColor = "#ef4444";
              ctx.fillStyle = `rgba(239,68,68,${flashAlpha})`;
              ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
              const crossT = (t - 0.35) / 0.65;
              const newTId = Math.floor(tv / 10),
                newDensity = tv % 10;
              const newColor =
                factionColors[(newTId - 1) % factionColors.length];
              ctx.globalAlpha = densityAlpha(newDensity) * crossT;
              ctx.fillStyle = newColor;
              ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

              if (newDensity >= 7 && crossT > 0.7) {
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = crossT;
                const center = tileSize / 2;
                const sz = newDensity === 9 ? 4 : 2;
                ctx.fillRect(
                  x * tileSize + center - sz / 2,
                  y * tileSize + center - sz / 2,
                  sz,
                  sz,
                );
              }
            }
            ctx.restore();
          });

          diff.grown.forEach((i) => {
            const tv = toSnap[i];
            if (!tv) return;
            const x = i % mapW,
              y = Math.floor(i / mapW);
            const tId = Math.floor(tv / 10),
              density = tv % 10;
            const color = factionColors[(tId - 1) % factionColors.length];
            ctx.save();

            ctx.globalAlpha = densityAlpha(density);
            ctx.fillStyle = hexToRgba(color, densityAlpha(density));
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

            if (t >= 0.3 && t <= 0.8) {
              const glowPhase = (t - 0.3) / 0.5;
              const glowT = Math.sin(glowPhase * Math.PI);
              ctx.shadowBlur = 20 * glowT;
              ctx.shadowColor = color;
              ctx.globalAlpha = 0.9 + 0.1 * glowT;
              ctx.fillStyle = color;
              ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

              if (density >= 7 && glowT > 0.7) {
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = glowT;
                const center = tileSize / 2;
                const sz = density === 9 ? 4 : 2;
                ctx.fillRect(
                  x * tileSize + center - sz / 2,
                  y * tileSize + center - sz / 2,
                  sz,
                  sz,
                );
              }
            } else if (density >= 7) {
              ctx.fillStyle = "#ffffff";
              ctx.globalAlpha = 1;
              const center = tileSize / 2;
              const sz = density === 9 ? 4 : 2;
              ctx.fillRect(
                x * tileSize + center - sz / 2,
                y * tileSize + center - sz / 2,
                sz,
                sz,
              );
            }
            ctx.restore();
          });
        }
      }
    },
    [
      canvasRef,
      heightMap,
      rivers,
      citySnapshots,
      currentEpoch,
      viewMode,
      seaLevel,
      suitabilityMap,
      factionColors,
    ],
  );

  const startTransition = useCallback(
    (fromEpoch, toEpoch, duration = 700) => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }

      const fromSnap = citySnapshots[fromEpoch];
      const toSnap = citySnapshots[toEpoch];

      if (!fromSnap || !toSnap) {
        setCurrentEpoch(toEpoch);
        return;
      }

      diffRef.current = computeDiff(fromSnap, toSnap);

      const startTime = performance.now();
      const loop = (now) => {
        const raw = Math.min((now - startTime) / duration, 1);
        const easedT =
          raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

        drawMain(fromEpoch, toEpoch, easedT, diffRef.current);

        if (raw < 1) {
          animRef.current = requestAnimationFrame(loop);
        } else {
          animRef.current = null;
          diffRef.current = null;
          setCurrentEpoch(toEpoch);
        }
      };

      animRef.current = requestAnimationFrame(loop);
    },
    [citySnapshots, computeDiff, drawMain, animRef, diffRef, setCurrentEpoch],
  );

  const drawMini = useCallback(() => {
    const cvs = miniRef.current;
    if (!cvs || !heightMap) return;
    const ctx = cvs.getContext("2d");
    cvs.width = mapW;
    cvs.height = mapH;
    const imgData = ctx.createImageData(mapW, mapH);
    const city = citySnapshots[currentEpoch];

    for (let i = 0; i < heightMap.length; i++) {
      const idx = i * 4;
      if (viewMode === "city" && city && city[i] > 0) {
        const tId = Math.floor(city[i] / 10);
        const c = factionColors[(tId - 1) % factionColors.length];
        const rgb = parseInt(c.slice(1), 16);
        imgData.data[idx] = (rgb >> 16) & 255;
        imgData.data[idx + 1] = (rgb >> 8) & 255;
        imgData.data[idx + 2] = rgb & 255;
        imgData.data[idx + 3] = 255;
      } else if (heightMap[i] <= seaLevel) {
        imgData.data[idx] = 30;
        imgData.data[idx + 1] = 58;
        imgData.data[idx + 2] = 138;
        imgData.data[idx + 3] = 255;
      } else {
        imgData.data[idx] = 40;
        imgData.data[idx + 1] = 100;
        imgData.data[idx + 2] = 60;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [
    miniRef,
    heightMap,
    citySnapshots,
    currentEpoch,
    seaLevel,
    factionColors,
    viewMode,
  ]);

  useEffect(() => {
    drawMain();
    drawMini();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [drawMain, drawMini, animRef]);

  useEffect(() => {
    if (!playing) return;
    if (currentEpoch >= maxEpochs) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(currentEpoch, currentEpoch + 1, 700);
    }, 50);
    return () => clearTimeout(timer);
  }, [playing, currentEpoch, startTransition, maxEpochs, setPlaying]);

  return { startTransition };
}
