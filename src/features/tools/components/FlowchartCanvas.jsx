export function FlowchartCanvas({
  containerRef,
  nodeCount,
  linkCount,
  isFullscreen = false,
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-slate-800 bg-white shadow-[0_24px_80px_rgba(2,6,23,0.38)] ${isFullscreen ? "h-full min-h-0" : "min-h-[560px]"}`}
      ref={containerRef}
    >
      {isFullscreen ? (
        <div className="pointer-events-none absolute left-4 bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Focused Canvas
          </p>
          <p className="mt-1 max-w-[240px] leading-5">
            Editor is hidden by default in fullscreen so the graph can use the
            full workspace. Reopen it from the overlay controls when needed.
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Canvas Overview
        </p>
        <p className="mt-1 leading-5">
          Nodes gently <strong>float while idle</strong> to keep the canvas
          alive.
        </p>
        <div className="mt-2 flex items-baseline gap-4">
          <p>
            <span className="text-lg font-semibold text-slate-900">
              {nodeCount}
            </span>{" "}
            nodes
          </p>
          <p>
            <span className="text-lg font-semibold text-slate-900">
              {linkCount}
            </span>{" "}
            links
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-10 space-y-1 rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
        {isFullscreen ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Fullscreen Mode
          </p>
        ) : null}
        <p>
          <strong>Scroll</strong> to zoom. <strong>Drag background</strong> to
          pan.
        </p>
        <p>
          <strong>Drag nodes</strong> to reposition them.{" "}
          <strong>Double-click node</strong> to reset their layout slot.
        </p>
      </div>
    </section>
  );
}
