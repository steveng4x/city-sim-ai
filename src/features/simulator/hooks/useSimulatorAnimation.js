import { useCallback, useEffect } from "react";
import { mapW, mapH, factionColors } from "@/features/simulator";

export function useSimulatorAnimation({
  miniRef,
  heightMap,
  resourceMap,
  citySnapshots,
  currentEpoch,
  setCurrentEpoch,
  viewMode,
  seaLevel,
  playing,
  setPlaying,
  maxEpochs,
}) {
  const startTransition = useCallback(
    (fromEpoch, toEpoch, duration = 700) => {
      // For R3F, we just update the epoch and the InstancedMap instantly updates matrices/colors
      setCurrentEpoch(toEpoch);
    },
    [setCurrentEpoch],
  );

  const drawMini = useCallback(() => {
    const cvs = miniRef.current;
    if (!cvs || !heightMap || !citySnapshots) return;
    const ctx = cvs.getContext("2d");
    cvs.width = mapW;
    cvs.height = mapH;
    const imgData = ctx.createImageData(mapW, mapH);
    const city = citySnapshots[currentEpoch];

    for (let i = 0; i < heightMap.length; i++) {
      const idx = i * 4;
      if (viewMode === "city" && city && city[i] > 0) {
        const tId = Math.floor(city[i] / 10);
        const density = city[i] % 10;
        const c = factionColors[(tId - 1) % factionColors.length];
        let r = parseInt(c.slice(1, 3), 16);
        let g = parseInt(c.slice(3, 5), 16);
        let b = parseInt(c.slice(5, 7), 16);

        if (density < 5) {
          const factor = (5 - density) * 0.15;
          r = Math.round(r * (1 - factor));
          g = Math.round(g * (1 - factor));
          b = Math.round(b * (1 - factor));
        } else if (density > 5) {
          const factor = (density - 5) * 0.15;
          r = Math.round(r + (255 - r) * factor);
          g = Math.round(g + (255 - g) * factor);
          b = Math.round(b + (255 - b) * factor);
        }

        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      } else if (heightMap[i] <= seaLevel) {
        imgData.data[idx] = 30;
        imgData.data[idx + 1] = 58;
        imgData.data[idx + 2] = 138;
        imgData.data[idx + 3] = 255;
      } else {
        if (resourceMap && resourceMap[i] === 1) {
          // Forest
          imgData.data[idx] = 6;
          imgData.data[idx + 1] = 78;
          imgData.data[idx + 2] = 59;
        } else if (resourceMap && resourceMap[i] === 2) {
          // Gold
          imgData.data[idx] = 234;
          imgData.data[idx + 1] = 179;
          imgData.data[idx + 2] = 8;
        } else {
          // Normal land
          imgData.data[idx] = 40;
          imgData.data[idx + 1] = 100;
          imgData.data[idx + 2] = 60;
        }
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
    resourceMap,
    viewMode,
  ]);

  useEffect(() => {
    drawMini();
  }, [drawMini]);

  useEffect(() => {
    if (!playing) return;
    if (currentEpoch >= maxEpochs) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(currentEpoch, currentEpoch + 1, 700);
    }, 700);
    return () => clearTimeout(timer);
  }, [playing, currentEpoch, startTransition, maxEpochs, setPlaying]);

  return { startTransition };
}
